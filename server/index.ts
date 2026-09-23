import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';
import { createAppointment } from './repositories/bookingRepository.js';
import { createHmac, timingSafeEqual } from 'node:crypto';

const app=express(); app.set('trust proxy', 1); const port=Number(process.env.PORT||4000);
if (process.env.NODE_ENV==='production' && (!process.env.DATABASE_URL || !process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET)) {
  throw new Error('Production requires DATABASE_URL, ADMIN_PASSWORD and AUTH_SECRET');
}
app.use(helmet({
  crossOriginResourcePolicy:{
    policy:'cross-origin'
  }
}));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  "https://bella-beaute-site-79ireo7r-zbatti-7216s-projects.vercel.app"
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        origin.endsWith(".vercel.app") ||
        origin === "http://localhost:5173" ||
        origin === "http://localhost:5174"
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({limit:'1mb'}));
const publicLimiter=rateLimit({windowMs:15*60*1000,max:120,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'طلبات كثيرة، يرجى المحاولة بعد قليل.'}});
app.use('/api',publicLimiter);
const adminEmail=process.env.ADMIN_EMAIL||'admin@bellabeaute.ma';
const adminPassword=process.env.ADMIN_PASSWORD||'';
const authSecret=process.env.AUTH_SECRET||process.env.JWT_SECRET||'development-only-change-me';
const signSession=(email:string)=>`${Buffer.from(JSON.stringify({email,role:'SUPER_ADMIN',exp:Date.now()+8*60*60*1000})).toString('base64url')}.${createHmac('sha256',authSecret).update(email).digest('base64url')}`;
const readSession=(req:express.Request)=>{const raw=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('bella_session='))?.slice(14);if(!raw)return null;const [payload,signature]=raw.split('.');if(!payload||!signature)return null;try{const data=JSON.parse(Buffer.from(payload,'base64url').toString());const expected=createHmac('sha256',authSecret).update(data.email).digest('base64url');if(data.exp<Date.now()||signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return null;return data;}catch{return null;}};
const requireAdmin=(req:express.Request,res:express.Response,next:express.NextFunction)=>{if(!readSession(req))return res.status(401).json({error:'يجب تسجيل الدخول'});next();};
const bookingSchema=z.object({name:z.string().min(2).max(80),phone:z.string().min(8).max(20),service:z.string().min(2).max(80),date:z.string().optional(),notes:z.string().max(500).optional()});
const orderSchema=z.object({name:z.string().min(2).max(80),phone:z.string().min(8).max(20),items:z.array(z.object({productId:z.string(),quantity:z.number().int().positive().max(10)})).min(1),address:z.string().min(5).max(300)});
app.get('/api/health',(_req,res)=>res.json({status:'ok',service:'bella-beaute-api'}));
app.post('/api/auth/login',(req,res)=>{const parsed=z.object({email:z.string().email(),password:z.string().min(8).max(200)}).safeParse(req.body);if(!parsed.success||!adminPassword||parsed.data.email!==adminEmail||parsed.data.password!==adminPassword)return res.status(401).json({error:'بيانات الدخول غير صحيحة'});res.setHeader(
  'Set-Cookie',
  `bella_session=${signSession(parsed.data.email)}; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=28800`
);  res.json({ok:true,user:{email:adminEmail,role:'SUPER_ADMIN'}});});
app.get('/api/auth/me',(req,res)=>{const session=readSession(req);if(!session)return res.status(401).json({error:'غير مصرح'});res.json({user:session});});
app.post('/api/auth/logout',(_req,res)=>{
  res.setHeader(
    'Set-Cookie',
    'bella_session=; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=0'
  );
  res.json({ok:true});
});
app.get('/api/admin/check',requireAdmin,(_req,res)=>res.json({ok:true}));
app.post('/api/bookings',async (req,res)=>{const parsed=bookingSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'بيانات الحجز غير صالحة',details:parsed.error.flatten()});
  try {
    if (process.env.DATABASE_URL) {
      const booking=await createAppointment(parsed.data);
      return res.status(201).json({ok:true,message:'تم استلام طلب الحجز',booking});
    }
  } catch (error) {
    console.error('BOOKING_PERSISTENCE_ERROR', error);
    return res.status(503).json({error:'الحجز غير متاح مؤقتاً، يرجى التواصل عبر واتساب.'});
  }
  console.log('BOOKING_RECEIVED',parsed.data);res.status(201).json({ok:true,message:'تم استلام طلب الحجز',booking:parsed.data});});
app.post('/api/orders',(req,res)=>{const parsed=orderSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'بيانات الطلب غير صالحة',details:parsed.error.flatten()});console.log('ORDER_RECEIVED',parsed.data);res.status(201).json({ok:true,message:'تم استلام الطلب',order:parsed.data});});
app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{console.error('API_ERROR',error);res.status(500).json({error:'حدث خطأ داخلي غير متوقع'});});
app.use((_req,res)=>res.status(404).json({error:'Not found'}));
app.listen(port,()=>console.log(`BELLA BEAUTÉ API listening on :${port}`));
