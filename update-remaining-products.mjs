import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'cavaly.db'));

const cdnUrls = [
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/RbbjO3oVkoHG.jpeg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/UTGOQ1ICVmMU.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/iOjA9l71fI1b.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/s95tSLxKjjZ2.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/wuUIJQDdkpwi.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/QMIWYe7b20WY.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/wtOPY9ctuEaN.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/KBfD4ArdMzzk.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/s03jZFhmp6FH.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/Y7dHvqqvU0UN.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/NhAix9ZZjsDq.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/1cng05MFpd1P.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/63u8YFxL5EPp.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/BNYpIoauGPWs.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/hI0en25OtXzF.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/K1VqBc6qu8Lb.webp",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/bZ5ZjAkVsd2W.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/O594NMFn6ZqE.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/DufPCkreg9jw.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/FFAtmUW405US.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/rM9QJwy6cfLo.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663089638801/P7T9o8Uhgub4.jpg",
];

try {
  for (let i = 0; i < cdnUrls.length && i < 22; i++) {
    const productId = 37 + i;
    const url = cdnUrls[i];
    
    const stmt = db.prepare('UPDATE products SET coverImageUrl = ? WHERE id = ?');
    stmt.run(url, productId);
    
    console.log(`OK Produit ${productId} mis a jour`);
  }
  
  console.log('\nTous les produits ont ete mis a jour avec succes!');
  db.close();
} catch (error) {
  console.error('Erreur:', error.message);
  process.exit(1);
}
