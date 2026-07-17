/** 数据持久化 API 客户端 —— 读写本地 data.json */

export interface ServerState {
  version: number;
  assets: unknown[];
  users: unknown[];
  operationLogs: unknown[];
}

export async function fetchState(): Promise<ServerState> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error(`获取数据失败: ${res.status}`);
  return res.json();
}

export async function saveState(data: {
  assets: unknown[];
  users: unknown[];
  operationLogs: unknown[];
}): Promise<void> {
  await fetch('/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

/** 300ms 防抖：避免频繁写入文件 */
export function scheduleSync(getState: () => {
  assets: unknown[];
  users: unknown[];
  operationLogs: unknown[];
  hydrated: boolean;
}) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const state = getState();
    if (!state.hydrated) return;
    saveState({
      assets: state.assets,
      users: state.users,
      operationLogs: state.operationLogs,
    }).catch(() => {
      // 写入失败静默处理，数据仍在内存中
    });
  }, 300);
}
