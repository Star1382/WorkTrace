/**
 * 示例任务数据 —— 新用户引导时用于演示功能
 * 通过 task:add 批量插入，包含不同象限和日期
 */

function sampleTasks(todayValue) {
  const day = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return [
    {
      title: '提交月度采购报表',
      description: '整理各部门采购数据，汇总后提交给财务部',
      quadrant: 1,
      status: 'todo',
      due_date: todayValue,
    },
    {
      title: '整理上周会议纪要',
      description: '将上周三部门会议的录音转为文字纪要并存档',
      quadrant: 2,
      status: 'in_progress',
      due_date: day(-1),
    },
    {
      title: '预约下季度培训场地',
      description: '联系行政部确认B栋3楼会议室可用时间',
      quadrant: 3,
      status: 'todo',
      due_date: day(3),
    },
    {
      title: '更新部门通讯录',
      description: '确认新入职3位同事的联系方式并更新共享通讯录',
      quadrant: 3,
      status: 'done',
      due_date: day(-2),
    },
    {
      title: '清理桌面文件归档',
      description: '将散落的纸质文件分类归档到文件柜',
      quadrant: 4,
      status: 'todo',
      due_date: day(5),
    },
  ];
}

export { sampleTasks };
