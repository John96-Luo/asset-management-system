import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = resolve(__dirname, '..', 'data.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

function loadData() {
  if (existsSync(DATA_FILE)) {
    try {
      const content = readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (data.assets && data.users) return data;
    } catch (err) {
      console.error('读取 data.json 失败:', err.message);
    }
  }
  return { version: 1, assets: [], users: [], operationLogs: [] };
}

function saveData(data) {
  writeFileSync(DATA_FILE, JSON.stringify({
    version: 1,
    lastSaved: new Date().toISOString(),
    assets: data.assets || [],
    users: data.users || [],
    operationLogs: data.operationLogs || [],
  }, null, 2), 'utf-8');
}

app.get('/api/state', (_req, res) => {
  res.json(loadData());
});

app.put('/api/state', (req, res) => {
  saveData(req.body);
  res.json({ success: true, timestamp: Date.now() });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

const PORT = 3001;

if (!existsSync(DATA_FILE)) {
  console.log('data.json 不存在，正在创建初始数据文件...');
  saveData({ assets: [], users: [], operationLogs: [] });
  console.log('data.json 已创建');
}

app.listen(PORT, () => {
  console.log(`数据服务已启动: http://localhost:${PORT}`);
  console.log(`数据文件: ${DATA_FILE}`);
}).on('error', (err) => {
  console.error('服务器启动失败:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('未捕获异常:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理的 Promise 拒绝:', reason);
});
