// 使用简化版的选项类型，避免与数据库完整类型冲突
interface SimpleChoiceOption {
  id: string;
  value: string;
  label: string;
}

// 导出简化版的筛选选项
export const readingFilterOptions: { [key: string]: SimpleChoiceOption[] } = {
  version: [
    { id: '1', value: 'pep', label: '人教版' },
    { id: '2', value: 'rj', label: '人教新起点' },
    { id: '3', value: 'yl', label: '译林版' },
    { id: '4', value: 'wj', label: '外研版' }
  ],
  grade: [
    { id: '1', value: '1', label: '一年级' },
    { id: '2', value: '2', label: '二年级' },
    { id: '3', value: '3', label: '三年级' },
    { id: '4', value: '4', label: '四年级' },
    { id: '5', value: '5', label: '五年级' },
    { id: '6', value: '6', label: '六年级' }
  ],
  theclass: [
    { id: '1', value: '1', label: '上学期' },
    { id: '2', value: '2', label: '下学期' }
  ],
  theunit: [
    { id: '1', value: '1', label: '单元一' },
    { id: '2', value: '2', label: '单元二' },
    { id: '3', value: '3', label: '单元三' },
    { id: '4', value: '4', label: '单元四' },
    { id: '5', value: '5', label: '单元五' },
    { id: '6', value: '6', label: '单元六' },
    { id: '7', value: '7', label: '单元七' },
    { id: '8', value: '8', label: '单元八' }
  ],
  ok: [
    { id: '1', value: 'yes', label: '已掌握' },
    { id: '2', value: 'no', label: '未掌握' }
  ]
};