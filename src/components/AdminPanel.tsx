import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';

export type AdminProduct = { id: string; name: string; frName: string; category: string; frCategory: string; price: string; image: string; images?: string[] };
type Props = { products: AdminProduct[]; salonImages: string[]; salonVideos: string[]; onSave: (product: AdminProduct) => void; onDelete: (id: string) => void; onMediaChange:(images:string[],videos:string[])=>void; onExit: () => void };
type ProductForm = Omit<AdminProduct,'id'>;
const blank:ProductForm={name:'',frName:'',category:'فستان سهرة',frCategory:'Robe de soirée',price:'',image:'',images:[]};

// ✅ رفع حقيقي إلى Supabase Storage بدل Base64
const uploadFile = async (file: File): Promise<string> => {

  if(file.size > 50 * 1024 * 1024){
    throw new Error("الفيديو أكبر من 50MB");
  }

  const ext = file.name.split('.').pop() || 'mp4';

  const folder = file.type.startsWith('video')
    ? 'videos'
    : 'images';

  const fileName =
    `${folder}/${crypto.randomUUID()}.${ext}`;

console.log("START UPLOAD", file.name, file.size);
  const { error } = await supabase.storage
    .from('bella-media')
    .upload(fileName, file, {
      cacheControl:'3600',
      upsert:false
    });

console.log("UPLOAD FINISHED", fileName);
  if(error){
    throw error;
  }


  const { data } =
    supabase.storage
    .from('bella-media')
    .getPublicUrl(fileName);


  return data.publicUrl;
};

const readFiles = async (files: FileList): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of Array.from(files)) {
    const url = await uploadFile(file);
    urls.push(url);
  }
  return urls;
};

export function AdminPanel({ products, salonImages, salonVideos, onSave, onDelete, onMediaChange, onExit }: Props) {
  const [form, setForm] = useState<ProductForm>(blank); const [editingId,setEditingId]=useState<string|null>(null); const [search,setSearch]=useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const totalValue=products.reduce((sum,p)=>sum+(Number(p.price.replace(/[^0-9]/g,''))||0),0); const categories=new Set(products.map(p=>p.category)).size;
  const filtered=products.filter(p=>`${p.name} ${p.frName} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
  const images=Array.from(new Set([form.image,...(form.images||[])].filter(Boolean)));
  const setProductImages=(next:string[])=>setForm({...form,image:next[0]||'',images:next});

  const submit=(event:FormEvent)=>{
    event.preventDefault();
    const product={...form,id:editingId||crypto.randomUUID(),image:images[0]||'',images};
    onSave(product);
    setEditingId(null);
    setForm(blank);
  };

  const handleProductImages = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setUploadError(null);
    try {
      const urls = await readFiles(files);
      setProductImages([...images, ...urls]);
    } catch (err: any) {
      setUploadError('فشل رفع الصورة: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setUploading(false);
    }
  };

  const addSalonImages = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setUploadError(null);
    try {
      const urls = await readFiles(files);
      onMediaChange([...salonImages, ...urls], salonVideos);
    } catch (err: any) {
      setUploadError('فشل رفع صورة الصالون: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setUploading(false);
    }
  };

  const addSalonVideos = async (files: FileList | null) => {
  if (!files) return;

  setUploading(true);
  setUploadError(null);

  try {
    const urls:string[] = [];

    for (const file of Array.from(files)) {

      const url = await uploadFile(file);
      urls.push(url);

      await supabase
        .from('salon_media')
        .insert({
          type: 'video',
          url: url
        });

    }

    onMediaChange(
      salonImages,
      [...salonVideos, ...urls]
    );

  } catch(err:any){

    setUploadError(
      'فشل رفع الفيديو: ' + err.message
    );

  } finally {

    setUploading(false);

  }
};

  return (
    <div className="admin-page" dir="rtl">
      <header className="admin-header">
        <div>
          <div className="section-label">BELLA BEAUTÉ / ADMIN</div>
          <h1>إدارة البوتيك والوسائط</h1>    
<button
  className="admin-logout"
  onClick={onExit}
>
  تسجيل الخروج
</button>




          <p>أضيفي الفساتين وصور وفيديوهات الصالون من مكان واحد.</p>
        </div>
        <button className="admin-exit" onClick={onExit}>العودة إلى الموقع ↗</button>
      </header>

      {/* ✅ شريط حالة الرفع */}
      {uploading && (
        <div className="upload-status uploading">⏳ جاري الرفع إلى Supabase...</div>
      )}
      {uploadError && (
        <div className="upload-status error">
          ⚠️ {uploadError}
          <button type="button" onClick={() => setUploadError(null)}>×</button>
        </div>
      )}

      <div className="admin-stats">
        <div><span>الفساتين</span><strong>{products.length}</strong></div>
        <div><span>التصنيفات</span><strong>{categories}</strong></div>
        <div><span>قيمة العرض</span><strong>{totalValue.toLocaleString('fr-MA')} DH</strong></div>
      </div>

      <div className="admin-layout">
        <form className="admin-form" onSubmit={submit}>
          <h2>{editingId ? 'تعديل الفستان' : 'إضافة فستان'}</h2>
          <label>اسم الفستان<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
          <label>الاسم بالفرنسية<input required value={form.frName} onChange={e=>setForm({...form,frName:e.target.value})}/></label>
          <label>التصنيف
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              <option>فستان سهرة</option>
              <option>زفاف</option>
              <option>إطلالة راقية</option>
            </select>
          </label>
          <label>السعر<input required value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="1,490 DH"/></label>
          <label>رابط صورة (اختياري)<input type="url" value={form.image} onChange={e=>setProductImages([e.target.value,...images.filter(x=>x!==form.image)])} placeholder="https://..."/></label>
          <label>
            صور الفستان — يمكن اختيار عدة صور
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={e => handleProductImages(e.target.files)}
            />
          </label>
          <div className="media-thumbs">
            {images.map((src,i) => (
              <div key={src}>
                <img src={src} alt={`صورة ${i+1}`}/>
                <button type="button" onClick={()=>setProductImages(images.filter(x=>x!==src))}>×</button>
                {i===0 && <small>الرئيسية</small>}
              </div>
            ))}
          </div>
          <button className="button gold" type="submit" disabled={uploading}>
            {editingId ? 'حفظ التعديل' : 'إضافة إلى المجموعة +'}
          </button>
          {editingId && (
            <button type="button" className="admin-cancel" onClick={()=>{setEditingId(null);setForm(blank)}}>
              إلغاء
            </button>
          )}
        </form>

        <section className="admin-products">
          <div className="admin-products-head">
            <h2>الفساتين الحالية</h2>
            <span>{products.length} منتجات</span>
          </div>
          <input className="admin-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحثي باسم الفستان أو التصنيف..."/>
          {filtered.map(product => (
            <article className="admin-product" key={product.id}>
              <img src={product.image} alt={product.name}/>
              <div>
                <h3>{product.name}</h3>
                <p>{product.category} · {product.price}</p>
                <small>{product.images?.length || 1} صور</small>
              </div>
              <div className="admin-product-actions">
                <button type="button" onClick={()=>{setEditingId(product.id);setForm({...product,images:product.images?.length?product.images:[product.image]})}}>تعديل</button>
                <button type="button" onClick={()=>onDelete(product.id)} aria-label={`حذف ${product.name}`}>حذف</button>
              </div>
            </article>
          ))}
        </section>
      </div>

      <section className="media-manager">
        <div>
          <div className="section-label">SALON CONTENT</div>
          <h2>صور وفيديوهات الصالون</h2>
          <p>تظهر الصور في معرض الموقع، وأول فيديو يظهر في الواجهة الرئيسية.</p>
        </div>
        <div className="media-upload-actions">
          <label>
            إضافة صور للمحل
            <input type="file" accept="image/*" multiple disabled={uploading} onChange={e=>addSalonImages(e.target.files)}/>
          </label>
          <label>
            إضافة فيديو للمحل
            {/* ✅ accept="video/*" بدل video/mp4,video/webm */}
            <input type="file" accept="video/*" multiple disabled={uploading} onChange={e=>addSalonVideos(e.target.files)}/>
          </label>
        </div>
        <div className="salon-media-grid">
          {salonImages.map(src => (
            <div key={src}>
              <img src={src} alt="صالون BELLA BEAUTÉ"/>
              <button type="button" onClick={()=>onMediaChange(salonImages.filter(x=>x!==src),salonVideos)}>حذف</button>
            </div>
          ))}
        {salonVideos.map(src => (
  <div key={src} className="media-video-card">
<video
  src={src}
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  poster="/hero-poster.webp"
  className="salon-video"
/>
    <button
      type="button"
      onClick={() =>
        onMediaChange(
          salonImages,
          salonVideos.filter(x => x !== src)
        )
      }
    >
      حذف الفيديو
    </button>

  </div>
))}
        
        </div>
      </section>
    </div>
  );
}