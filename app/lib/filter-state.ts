// 获取用户筛选状态
export async function getUserFilterState(): Promise<Record<string, string[]>> {
  try {
    const response = await fetch('/api/filter-state', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch filter state');
    }

    const data = await response.json();
    return data.filterState || {};
  } catch (error) {
    console.error('Error fetching filter state:', error);
    return {};
  }
}

// 保存用户筛选状态
export async function saveUserFilterState(filterState: Record<string, string[]>): Promise<boolean> {
  try {
    const response = await fetch('/api/filter-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filterState }),
    });

    if (!response.ok) {
      throw new Error('Failed to save filter state');
    }

    return true;
  } catch (error) {
    console.error('Error saving filter state:', error);
    return false;
  }
}