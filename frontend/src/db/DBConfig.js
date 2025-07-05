
import Dexie from 'dexie';

function DBConfig() {
  const db = new Dexie('FloriDB');
  db.version(1).stores({
    exams: '++id,tid,examjson,duration,max_points',
    users: '++id,uid,email,name,last_tid,fingerprint',
    users_answ: '++id,tid,uid,answers,completed,points,media_downloaded',
    media: '++id,media_id,content,db_size,db_compress_size,time_comp,type,filename'
  });

  return db;
}

export default DBConfig;