import { getDb } from './server/db.ts';
import { products } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const imageUpdates = [
  { id: 1, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/vfyDCKnrRTroIQsI.jpg' },
  { id: 2, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/sUCTrCmlPxpCddHY.jpg' },
  { id: 3, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/aRUcWdcPmYHuekNo.jpg' },
  { id: 4, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/pJGMQPqpSqLLsfbu.jpg' },
  { id: 5, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/sDaeBaykjDXZpphJ.jpg' },
  { id: 6, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/LXPILuApAprFCeBB.jpg' },
  { id: 7, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/AOtOMrzIwRXzgJJf.jpg' },
  { id: 8, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/DYsXOiIcopJbimOQ.jpg' },
  { id: 9, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/lAuHWXBhGmXCmENY.jpg' },
  { id: 10, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/KIuqEPKbDqTUzGZy.jpg' },
  { id: 11, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/eOHdGbOPKXYvYCPn.jpg' },
  { id: 12, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/eakOCdjXFbfvCrgy.jpg' },
  { id: 13, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/jDCKiuLjmzOjWHiN.jpg' },
  { id: 14, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/horyyLteNjxCOClm.jpg' },
  { id: 15, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/pgDhoeHIHcQwSiSb.jpg' },
  { id: 16, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/WokWEzNLeQQWMzzH.jpg' },
  { id: 17, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/cGtjtyVrZTMLuNzz.jpg' },
  { id: 18, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/ljOILWUuhxMdwOEV.jpg' },
  { id: 19, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/hsCpjJQvjSUghfbv.jpg' },
  { id: 20, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/WHDNJNIOqUJbwgtQ.webp' },
  { id: 21, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/AiQJIxOVupYmxCqw.png' },
  { id: 22, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/aimJPFORgYehHIKW.jpg' },
  { id: 23, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/ddiJTjRbftuZRbaI.jpg' },
  { id: 24, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/uRDBqINGzsLXMrzu.jpg' },
  { id: 25, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/CQMeaKhZFYChmHbv.jpg' },
  { id: 26, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/KIuqEPKbDqTUzGZy.jpg' },
  { id: 27, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/rXnZKpTFYUyBGrsu.jpg' },
  { id: 28, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/CuMLgskrZXkPCley.jpg' },
  { id: 29, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/eakOCdjXFbfvCrgy.jpg' },
  { id: 30, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/GsDuQqtiWWSAUQvr.jpg' },
  { id: 31, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/lAuHWXBhGmXCmENY.jpg' },
  { id: 32, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/GMFntuJdPmTXKCuK.jpg' },
  { id: 33, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/sUCTrCmlPxpCddHY.jpg' },
  { id: 34, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/DYsXOiIcopJbimOQ.jpg' },
  { id: 35, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/pgDhoeHIHcQwSiSb.jpg' },
  { id: 36, url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/LXPILuApAprFCeBB.jpg' },
];

async function updateImages() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('Database not available');
      process.exit(1);
    }

    for (const update of imageUpdates) {
      await db.update(products)
        .set({ coverImageUrl: update.url })
        .where(eq(products.id, update.id));
      console.log(`✓ Updated product ${update.id}`);
    }
    console.log('✓ Toutes les images ont été mises à jour!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des images:', error);
    process.exit(1);
  }
}

updateImages();
