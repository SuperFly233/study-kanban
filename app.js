const DAY_MS=86400000;
const SUPABASE_CONFIG={
  url:'https://uoifrqehkfvpzqojaazh.supabase.co',
  anonKey:'sb_publishable_G-_4O-n-Q73TbJ4R2YmG9w_7WlKHC80',
};
let cloudClient=null;
let cloudUser=null;
let cloudBusy=false;
let passwordRecoveryMode=false;
let cloudBootstrapped=false;
let countdownTimer=null;
const toastState=new Map();
const EXAMS={
  cet6:{
    name:'CET-6 六级',
    short:'CET-6',
    start:'2026-04-18',
    end:'2026-06-13',
    examTime:'15:00',
    examDateLabel:'6 月 13 日',
    target:'550+',
    resources:['B站 · 瑞思拜（听力/阅读/外刊）','B站 · 爱学习的小Q（翻译/写作）','B站 · 爱吃蕃茄鸡蛋仔','小红书 · 游（翻译/写作）','小红书 · 柴犬（写作）'],
    quickLinks:[
      {name:'瑞思拜',items:[
        {label:'主页',url:'https://space.bilibili.com/11021614/lists'},
        {label:'词汇',url:'https://www.bilibili.com/video/BV1QNFGzqEVW'},
        {label:'听力',url:'https://www.bilibili.com/video/BV1eMPnzGE23'},
        {label:'阅读',url:'https://www.bilibili.com/video/BV1RgPpzUEuk/'},
        {label:'翻译：暂未更新'},
        {label:'写作：暂未更新'},
      ]},
      {name:'游',items:[
        {label:'主页',url:'https://www.xiaohongshu.com/user/profile/5becdcb7688bb700019843e5?channel_type=web_note_detail_r10&parent_page_channel_type=web_profile_board&xsec_token=ABD5uS3C2urV5K87n2OAi2DksqhHJH58wLBc6aefkWnw0%3D'},
        {label:'冲600规划',url:'https://www.xiaohongshu.com/user/profile/5becdcb7688bb700019843e5/?xsec_token=ABmMSsrXfjS3iRwKxA_9PS7uI5fuc2zI2ZjAvVCvufAhU=&xsec_source=pc_user'},
        {label:'经验帖索引',url:'https://www.xiaohongshu.com/user/profile/5becdcb7688bb700019843e5/?xsec_token=ABmMSsrXfjS3iRwKxA_9PS7uI5fuc2zI2ZjAvVCvufAhU=&xsec_source=pc_user'},
        {label:'背单词',url:'https://www.xiaohongshu.com/user/profile/5becdcb7688bb700019843e5/?xsec_token=ABmMSsrXfjS3iRwKxA_9PS7uI5fuc2zI2ZjAvVCvufAhU=&xsec_source=pc_user'},
        {label:'听力',url:'https://www.xiaohongshu.com/user/profile/5becdcb7688bb700019843e5/?xsec_token=ABmMSsrXfjS3iRwKxA_9PS7uI5fuc2zI2ZjAvVCvufAhU=&xsec_source=pc_user'},
        {label:'翻译',url:'https://www.xiaohongshu.com/user/profile/5becdcb7688bb700019843e5/?xsec_token=ABmMSsrXfjS3iRwKxA_9PS7uI5fuc2zI2ZjAvVCvufAhU=&xsec_source=pc_user'},
        {label:'写作',url:'https://www.xiaohongshu.com/explore/6801c728000000000900d492?app_platform=ios&app_version=9.19.4&share_from_user_hidden=true&xsec_source=app_share&type=normal&xsec_token=CB61TBJQXGP-Iqcn0KiggMSx6fxpNxMwrHvS7IZjDWHYc=&author_share=1&xhsshare=CopyLink&shareRedId=ODdENjQ3Sj42NzUyOTgwNjczOTc7PUpL&apptime=1776495948&share_id=4d9e608bb3c2474d8476922d54367b9e&wechatWid=8a1d35985f917c4c5c2fb39f20b728ae&wechatOrigin=menu'},
      ]},
      {name:'柴犬老师',items:[
        {label:'主页',url:'https://www.xiaohongshu.com/user/profile/648f150b000000002a034f43?xsec_token=YB0onyMoVTcOGX9YdOHjpuXXO6exqzf5MN8IAv-1znUrs=&xsec_source=app_share&xhsshare=WeixinSession&appuid=61b612f500000000100078db&apptime=1776496083&share_id=1264b3b4f54d4dddaf54e6a145753975'},
      ]},
      {name:'爱学习的小Q',items:[
        {label:'主页',url:'https://space.bilibili.com/11714311/lists'},
        {label:'翻译',url:'https://www.bilibili.com/video/BV1VW4UzLEWu/'},
      ]},
    ],
    prep:[
      {id:'vocab',title:'单词 / 输入记录',content:`可补充：
1. 今天背的高频词、熟词僻义
2. 瑞思拜外刊课里值得复用的表达
3. 容易混淆的近义词
4. 真题阅读里反复遇到的词组`},
      {id:'listening',title:'听力 SOP / 技巧',content:`可补充：
1. 做题前看选项，预判话题和关键词
2. 做题后复盘：没听到 / 听到了没反应过来 / 选项替换没识别
3. 每天保持 30-60 min，听力最怕断
4. 重点整理同义替换、转折、因果、态度词`},
      {id:'reading',title:'阅读 SOP / 错因',content:`可补充：
1. 错因分类：理解错 / 定位错 / 推理错
2. 十五选十：词性、搭配、上下文逻辑
3. 匹配题：先看题干关键词，再扫段落主旨
4. Section C：定位后精读，不凭印象选`},
      {id:'translation',title:'翻译精修超强 SOP',content:`CET-4/6翻译精修“超强SOP”
第一阶段：横向诊断（多模型对比）
这是我翻译的四六级题目：


我的译文是：


请按照四六级（甚至雅思托福等）专业评分标准，从“（语法正确性、词汇精度、句法结构）信、达、雅”三个维度，指出我存在的问题；提供更地道、更符合书面表达的高级版本，并说明高级版好在哪里。

第二阶段：深度打磨与回译
这是我修订后的版本。请再次检查（将我修订后的英文译文翻译成中文。看看是否能精准还原原题的意思？），指出其反映出了我哪些问题，并给我提供一些改进的建议与方向。然后并且提供更地道、更符合书面表达的高级版本，并说明高级版好在哪里。

第三阶段：能力沉淀与迁移
根据我这篇翻译的表现，请分析我最薄弱的语法或表达习惯。请给我出一些对应的中译英短句练习，帮我巩固。

结合我写的这篇翻译的主题，为我提供一些可以记忆背诵的主题表达（句式，词汇），用于备考同类型的翻译。`},
      {id:'writing',title:'写作素材 / 模板池',content:`可补充：
1. 首段定式
2. 中间段论点：信息与科技 / 学习与成长 / 社会生活 / 个人品质
3. 可化用句型
4. 游、柴犬老师的好表达
5. 自己写过、考场可复用的例子`},
      {id:'general',title:'其他考试技巧',content:`可补充：
1. 考前时间分配
2. 做题顺序
3. 作文、翻译、听力、阅读各部分保底策略
4. 考前一天检查清单
5. 考场心态提醒`},
    ],
    tips:['听力是纸老虎，坚持 30–40 天会有质变，关键是不要断。','翻译和写作分值一样，每天积累表达，不要等最后再补。','阅读保持手感和速度，难句用 AI 拆清楚再复盘。','背单词不是孤立任务，配合瑞思拜外刊课做输入。'],
    modules:[
      {id:'vocab',title:'背单词',subs:['背单词 + 看瑞思拜外刊课','背单词 + 外刊课复盘','背单词 + 外刊课保持输入'],badge:'必做',type:'must',aliases:['背单词'],skill:'从现在一直背到考试，挑一本厚词书全面扫盲。单词不要孤立背，配合瑞思拜外刊课做输入，把高频表达和熟词僻义记下来。'},
      {id:'listening',title:'听力',subs:['30–45 min 做题+复盘，瑞思拜','45–60 min，开始计时','每日必做，绝不能断'],badge:'必做',type:'must',aliases:['听力练习','听力加强','听力冲刺'],skill:'听力用进废退，要练就连续练。目标 210，建议考前 45–60 天每天 30–60 分钟做题 + 复盘，重点看“更适合普通人的听力方法论”。'},
      {id:'reading',title:'阅读',subs:['精读难句，不看解析先拆题','计时阅读，复盘错因','保持速度，稳住正确率'],badge:'必做',type:'must',aliases:['阅读精做','阅读计时'],skill:'阅读先扩词汇和复健理解，再提升正确率。错因按理解错、定位错、推理错分类；后期只保留必要练习量维持手感。'},
      {id:'translation',title:'翻译',subs:['每天积累表达，分话题记句型','每天积累表达，隔天做半题','真题继续刷，打字练习'],badge:'每日积累',type:'must',aliases:['翻译积累','翻译','翻译每日一练'],skill:'翻译要细水长流。分话题练近 4–5 年真题，打字练习，对照 AI 答案，总结表达和造句方式。可以看爱学习的小Q的翻译视频。'},
      {id:'writing',title:'写作',subs:['读范文，整理可化用句子','读范文 + 自己仿写一段','开始动笔，分话题练'],badge:'积累',type:'warn',aliases:['写作范文','写作练习'],skill:'写作高分靠学习、积累、化用，不靠临场原创。先学 5–10 篇文章，再分话题模仿真题，优先看“游”和柴犬的作文素材。'},
    ],
    phases:[
      {name:'阶段一：打基础',at:0,desc:'单词、听力、阅读、翻译、写作全部启动'},
      {name:'阶段二：全面推进',at:.34,desc:'听力加量，阅读计时，翻译写作稳定积累'},
      {name:'阶段三：冲刺',at:.67,desc:'整卷模拟，补弱项，保持每天五模块'},
      {name:'考试日',at:1,desc:'上考场，稳住节奏'},
    ],
  },
  accounting:{
    name:'初级会计',
    short:'初级会计',
    start:'2026-04-16',
    end:'2026-05-16',
    examTime:'09:00',
    examDateLabel:'5 月 16 日',
    target:'过线',
    resources:['B站 · 饼叔 21天初级会计冲刺集训营','四色笔记 700 题','押题试卷三套','实务 + 经济法大题课'],
    prep:[
      {id:'course',title:'刷课记录',content:`可补充：
1. 当前学到哪一节
2. 今天听课卡住的点
3. 需要回看的章节
4. 5 月 5 日前清前期课，5 月 6 日开始押题课`},
      {id:'practice',title:'刷题记录',content:`可补充：
1. 今天刷了哪些 700 题 / 押题卷
2. 错得最多的章节
3. 需要回看课程的位置
4. 第二天优先处理的题型`},
    ],
    tips:['初会只看两件事：今天有没有刷课，今天有没有刷题。','5 月 5 日前把前期课和题清完，5 月 6 日开始押题试卷课和试卷。','刷题不用追求一次全会，先把当天安排刷完。'],
    modules:[
      {id:'course',title:'刷课',badge:'主线',type:'must',skill:'5 月 5 日前按 Day 刷前期课程；5 月 6 日开始刷押题试卷课。今天只问一件事：课有没有推进。'},
      {id:'practice',title:'刷题',badge:'同步',type:'must',skill:'前期配 700 题；5 月 6 日后配押题试卷。重点是把当天安排刷完。'},
    ],
    phases:[
      {name:'前期：刷课 + 刷题',at:0,desc:'5 月 5 日前，刷完前期课，同步推进 700 题'},
      {name:'押题：试卷课 + 试卷',at:.67,desc:'5 月 6 日开始，押题试卷的课和试卷一起推进'},
      {name:'Done',at:1,desc:'收尾复盘，轻装上阵'},
    ],
    schedule:{
      1:['实务01第一章 01:03:37'],
      2:['实务02第二章1 01:02:24','实务03第二章2 01:07:35'],
      3:['实务04第三章1 48:03','实务05第三章2 01:01:24','实务06第三章3 01:19:41'],
      4:['实务07第四章1 01:12:58','实务08第四章2 26:05','实务09第四章3 31:46','实务10第四章4 46:33'],
      5:['实务11第五章1 34:53','实务12第五章2 30:08','实务13第五章3 42:46'],
      6:['实务14第六章 48:35'],
      7:['实务15第七章1 35:02','实务16第七章2 53:47'],
      8:['实务17第八章1 37:25','实务18第八章2 14:00'],
      9:['实务19第九章 36:48'],
      10:['实务20第十章 34:10'],
      11:['经济法01第一章 42:02'],
      12:['经济法02第二章1 39:44','经济法03第二章2 18:00'],
      13:['经济法04第三章1 22:53','经济法05第三章2 01:08:36','经济法06第三章3 18:09'],
      14:['经济法07第四章1 47:53','经济法08第四章2 46:14','经济法09第四章3 48:19','经济法10第四章4 17:36'],
      15:['经济法11第五章1 46:21','经济法12第五章2 24:27','经济法13第五章3 30:26','经济法14第五章4 24:06'],
      16:['经济法15第六章1 49:04','经济法16第六章2 36:01'],
      17:['经济法17第七章 45:45'],
      18:['经济法18第八章1 01:06:54','经济法19第八章2 25:49'],
      19:['01实务大题1 26:25','02实务大题2 21:14','03实务大题3 13:43','04实务大题4 12:07'],
      20:['05实务大题5 12:29','06实务大题6 18:09','01经济法大题1 10:09','02经济法大题2 09:40'],
      21:['03经济法大题3 08:13','04经济法大题4 06:35','05经济法大题5 16:28','06经济法大题6 06:21'],
      22:['押题（一）实务单选题 47:02','押题（一）实务多选题 20:29','押题（一）实务判断题 09:43','押题（一）实务不定项 39:22'],
      23:['押题（一）经济法单选题 35:05','押题（一）经济法多选题 11:36','押题（一）经济法判断题 06:33','押题（一）经济法不定项 20:55'],
      24:['押题（二）实务单选题 44:48','押题（二）实务多选题 17:42','押题（二）实务判断题 08:51','押题（二）实务不定项 43:21'],
      25:['押题（二）经济法单选题 33:22','押题（二）经济法多选题 14:38','押题（二）经济法判断题 08:56','押题（二）经济法不定项 24:21'],
      26:['押题（三）实务单选题 41:22','押题（三）实务多选题 22:36','押题（三）实务判断题 09:52','押题（三）实务不定项 37:34'],
      27:['押题（三）经济法单选题 27:14','押题（三）经济法多选题 09:48','押题（三）经济法判断题 05:01','押题（三）经济法不定项 22:22'],
    },
  },
};

let activeExamId=localStorage.getItem('active_exam')||'cet6';
let activeView='today';
let calMonth=new Date(today().getFullYear(),today().getMonth(),1);
let selectedCalKey=dayKey(today());
const selectedTaskByExam={cet6:'vocab',accounting:'course'};

function exam(){return EXAMS[activeExamId]}
function today(){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function dayKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDate(s){const p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n)}
function daysBetween(a,b){return Math.round((b-a)/DAY_MS)}
function examTimeKey(id=activeExamId){return `exam_time_${id}`}
function defaultExamDateTime(id=activeExamId){const e=EXAMS[id];return `${e.end}T${e.examTime||'00:00'}`}
function getExamDateTimeValue(id=activeExamId){return localStorage.getItem(examTimeKey(id))||defaultExamDateTime(id)}
function parseDateTimeLocal(value){const [date,time='00:00']=String(value).split('T');const [y,m,d]=date.split('-').map(Number);const [hh=0,mm=0]=time.split(':').map(Number);return new Date(y,m-1,d,hh,mm)}
function examTargetDate(id=activeExamId){return parseDateTimeLocal(getExamDateTimeValue(id))}
function examEndDate(id=activeExamId){const target=examTargetDate(id);return new Date(target.getFullYear(),target.getMonth(),target.getDate())}
function examDateText(id=activeExamId){
  const target=examTargetDate(id);
  return target.toLocaleString('zh-CN',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
}
function defaultExamDateText(id=activeExamId){
  const target=parseDateTimeLocal(defaultExamDateTime(id));
  return target.toLocaleString('zh-CN',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
}
function formatCountdownDays(days){
  if(days<=0)return '0';
  return days>=1?days.toFixed(5):days.toFixed(6);
}
function formatCountdownHTML(days){
  const text=formatCountdownDays(days);
  const [main,fraction]=text.split('.');
  return fraction?`<span class="count-int">${main}</span><span class="count-dot">.</span><span class="count-frac">${fraction}</span>`:`<span class="count-int">${main}</span>`;
}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function keyFor(date){return `checks_${activeExamId}_${dayKey(date)}`}
function prepKey(id){return `prep_${activeExamId}_${id}`}
function loadChecks(date){return JSON.parse(localStorage.getItem(keyFor(date))||'[]')}
function saveChecks(date,items){const key=keyFor(date);localStorage.setItem(key,JSON.stringify([...new Set(items)]));syncKeyToCloud(key)}
function loadPrep(item){return localStorage.getItem(prepKey(item.id))??item.content}
function savePrep(id,value){const key=prepKey(id);localStorage.setItem(key,value);syncKeyToCloud(key)}
function syncableKey(key){return key.startsWith('checks_')||key.startsWith('prep_')||key.startsWith('exam_time_')||key==='active_exam'||key==='theme'}
function syncableItems(){
  const items={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(syncableKey(key))items[key]=localStorage.getItem(key);
  }
  return items;
}
function cloudRawMap(rows){const out={};(rows||[]).forEach(row=>{if(syncableKey(row.key))out[row.key]=String(row.value?.raw??'')});return out}
function mapsEqual(a,b){const keys=new Set([...Object.keys(a),...Object.keys(b)]);for(const key of keys){if((a[key]??null)!==(b[key]??null))return false}return true}
function syncKind(key){
  if(key.startsWith('checks_'))return '打卡';
  if(key.startsWith('prep_'))return '大合集';
  if(key.startsWith('exam_time_'))return '考试时间';
  return '设置';
}
function syncDiffStats(local,remote){
  const keys=[...new Set([...Object.keys(local),...Object.keys(remote)])].sort();
  const stats={localTotal:Object.keys(local).length,remoteTotal:Object.keys(remote).length,localOnly:0,remoteOnly:0,changed:0,diffs:[],kinds:{}};
  const ensure=kind=>stats.kinds[kind]||(stats.kinds[kind]={local:0,remote:0,diff:0});
  Object.keys(local).forEach(key=>ensure(syncKind(key)).local+=1);
  Object.keys(remote).forEach(key=>ensure(syncKind(key)).remote+=1);
  keys.forEach(key=>{
    const inLocal=Object.prototype.hasOwnProperty.call(local,key);
    const inRemote=Object.prototype.hasOwnProperty.call(remote,key);
    const kind=ensure(syncKind(key));
    if(!inRemote){stats.localOnly+=1;kind.diff+=1;stats.diffs.push({key,type:'本机独有',local:local[key],remote:''});return}
    if(!inLocal){stats.remoteOnly+=1;kind.diff+=1;stats.diffs.push({key,type:'云端独有',local:'',remote:remote[key]});return}
    if(local[key]!==remote[key]){stats.changed+=1;kind.diff+=1;stats.diffs.push({key,type:'同名不同',local:local[key],remote:remote[key]})}
  });
  stats.diffTotal=stats.localOnly+stats.remoteOnly+stats.changed;
  return stats;
}
function syncValuePreview(key,value){
  if(value===''||value===undefined||value===null)return '无';
  if(key.startsWith('checks_')){
    try{return `${JSON.parse(value).length} 项：${JSON.parse(value).join('、')||'空'}`}catch{return String(value)}
  }
  const text=String(value).replace(/\s+/g,' ').trim();
  return text.length>120?`${text.slice(0,120)}…`:text;
}
function mergeSyncItems(local,remote){
  const merged={...remote};
  const keys=new Set([...Object.keys(local),...Object.keys(remote)]);
  keys.forEach(key=>{
    const l=local[key], r=remote[key];
    if(r===undefined){merged[key]=l;return}
    if(l===undefined||l===r)return;
    if(key.startsWith('checks_')){
      try{
        merged[key]=JSON.stringify([...new Set([...(JSON.parse(r)||[]),...(JSON.parse(l)||[])])]);
      }catch{merged[key]=r}
      return;
    }
    if(key.startsWith('prep_')){
      merged[key]=`${r}\n\n—— 本机内容（合并保留）——\n${l}`;
    }
  });
  return merged;
}
function taskDone(task,checks){return checks.includes(task.id)||(task.aliases||[]).some(a=>checks.includes(a)||checks.includes(a.replace(/\s/g,'_')))}
function countDone(tasks,checks){return tasks.filter(t=>taskDone(t,checks)).length}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function examDayIndex(date){return daysBetween(parseDate(exam().start),date)+1}
function phaseIndex(date){
  const e=exam(), start=parseDate(e.start), end=examEndDate(), total=Math.max(1,daysBetween(start,end)), passed=daysBetween(start,date);
  if(passed<0)return -1;
  if(passed>=total)return e.phases.length-1;
  let idx=0;
  e.phases.forEach((p,i)=>{if(passed/total>=p.at)idx=i});
  return idx;
}
function tasksFor(date){
  const e=exam(), idx=examDayIndex(date), phase=phaseIndex(date);
  if(phase<0)return [];
  if(activeExamId==='accounting'){
    const lessons=e.schedule[idx]||[];
    const pledgeStart=parseDate('2026-05-06');
    const inPrediction=date>=pledgeStart;
    return e.modules.map(m=>{
      let sub='按计划推进';
      if(m.id==='course')sub=inPrediction
        ? (lessons.length?`押题课：${lessons.join('；')}`:'押题试卷课 + 回看薄弱点')
        : (lessons.length?`Day ${idx}：${lessons.join('；')}`:'前期课程收尾，回看薄弱章');
      if(m.id==='practice')sub=inPrediction?'押题试卷按套刷':'配套刷 700 题，先完成量';
      return {...m,sub};
    });
  }
  return e.modules.map(m=>({...m,sub:m.subs[clamp(phase,0,m.subs.length-1)],aliases:m.aliases||[]}));
}
function tipFor(date){
  const e=exam(), ds=Math.max(0,daysBetween(parseDate(e.start),date));
  return e.tips[ds%e.tips.length];
}

function renderExamSwitch(){
  const box=document.getElementById('exam-switch');
  const mobile=document.getElementById('mobile-exam');
  box.innerHTML='';
  mobile.innerHTML='';
  Object.entries(EXAMS).forEach(([id,e])=>{
    const b=document.createElement('button');
    b.className='exam-btn'+(id===activeExamId?' active':'');
    b.textContent=e.short;
    b.onclick=()=>switchExam(id);
    box.appendChild(b);
    const opt=document.createElement('option');
    opt.value=id;
    opt.textContent=e.short;
    opt.selected=id===activeExamId;
    mobile.appendChild(opt);
  });
}
function switchExam(id){
  activeExamId=id;
  localStorage.setItem('active_exam',id);
  syncKeyToCloud('active_exam');
  if(!selectedTaskByExam[id]||id==='accounting') selectedTaskByExam[id]=id==='accounting'?'course':'vocab';
  const start=parseDate(exam().start), t=today();
  calMonth=new Date(t.getFullYear(),t.getMonth(),1);
  selectedCalKey=dayKey(t<start?start:t);
  renderAll();
}
function showView(id,btn){
  activeView=id;
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('view-'+id).classList.add('active');
  if(btn)btn.classList.add('active');else document.getElementById('nav-'+id)?.classList.add('active');
  renderActive();
}
function renderAll(){
  renderExamSwitch();
  document.getElementById('app-title').textContent=exam().name;
  document.getElementById('app-sub').textContent=`本地日期：${today().toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'})}`;
  renderActive();
}
function renderActive(){
  if(activeView==='today')renderToday();
  if(activeView==='calendar')renderCalendar();
  if(activeView==='list')renderList();
  if(activeView==='plan')renderPlan();
  if(activeView==='settings')renderSettings();
  refreshMobilePin();
}

function renderToday(){
  const e=exam(), d=today(), start=parseDate(e.start), end=examEndDate(), target=examTargetDate(), passed=clamp((Date.now()-start.getTime())/(target.getTime()-start.getTime()),0,1), left=Math.max(0,Math.ceil((target-Date.now())/DAY_MS));
  const phase=phaseIndex(d), phaseName=phase>=0?e.phases[phase].name:'尚未开始';
  document.getElementById('today-date').textContent=d.toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
  document.getElementById('today-phase').textContent=phaseName;
  document.getElementById('today-left').textContent=left>0?`${e.name} 考试时间：${examDateText()}，还剩 ${left} 天`:`今天是 ${e.name} 考试日（${examDateText()}），收尾复盘`;
  document.getElementById('pin-phase').textContent=phaseName;
  document.getElementById('pin-days').textContent=left>0?`${left} 天`:'考试日';
  document.getElementById('pin-left').textContent=left;
  document.getElementById('prog-bar').style.width=`${Math.round(passed*100)}%`;
  updateCountdown();
  const tasks=tasksFor(d), checks=loadChecks(d);
  if(!tasks.some(t=>t.id===selectedTaskByExam[activeExamId])) selectedTaskByExam[activeExamId]=tasks[0]?.id;
  renderTip(tasks);
  const grid=document.getElementById('tasks-grid');
  grid.innerHTML='';
  tasks.forEach(task=>{
    const done=taskDone(task,checks);
    const card=document.createElement('div');
    card.dataset.taskId=task.id;
    card.tabIndex=0;
    card.className='module-card'+(done?' done':'')+(selectedTaskByExam[activeExamId]===task.id?' selected':'');
    card.innerHTML=`<div><div class="module-top"><div class="module-title">${escapeHTML(task.title)}</div><button class="check" type="button" aria-label="${done?'取消':'完成'}${escapeHTML(task.title)}">${done?'✓':''}</button></div><div class="module-sub">${escapeHTML(task.sub)}</div></div><span class="badge ${task.type||''}">${escapeHTML(task.badge)}</span>`;
    const selectOnly=()=>selectTaskForTip(task.id,tasks);
    card.addEventListener('mouseenter',selectOnly);
    card.addEventListener('focusin',selectOnly);
    card.addEventListener('click',()=>{
      selectOnly();
      if(!isMobileView())toggleTaskDone(d,task);
    });
    card.querySelector('.check').addEventListener('click',ev=>{
      ev.stopPropagation();
      toggleTaskDone(d,task);
    });
    grid.appendChild(card);
  });
  renderStats();
  renderQuickLinks();
  renderPrepHub();
  refreshMobilePin();
}
function updateCountdown(){
  const e=exam(), target=examTargetDate(), now=Date.now(), ms=Math.max(0,target.getTime()-now), days=ms/DAY_MS, whole=Math.ceil(days);
  const label=document.getElementById('count-label'), num=document.getElementById('countdown-num'), sub=document.getElementById('countdown-sub');
  if(label)label.textContent=`距 ${examDateText()} 考试`;
  if(num)num.innerHTML=formatCountdownHTML(days);
  if(sub)sub.textContent=ms>0?'数字在动，今天就别欠账':'Done，回看错题和薄弱点';
  const pinDays=document.getElementById('pin-days'), pinLeft=document.getElementById('pin-left'), statLeft=document.getElementById('s-left');
  if(pinDays)pinDays.textContent=ms>0?`${whole} 天`:'考试日';
  if(pinLeft)pinLeft.textContent=whole;
  if(statLeft)statLeft.textContent=whole;
}
function renderTip(tasks){
  const selected=tasks.find(t=>t.id===selectedTaskByExam[activeExamId])||tasks[0];
  const text=selected?.skill||tipFor(today());
  document.getElementById('tip-card').textContent=text;
  document.getElementById('pin-tip').textContent=text;
}
function selectTaskForTip(id,tasks){
  selectedTaskByExam[activeExamId]=id;
  document.querySelectorAll('#tasks-grid .module-card').forEach(card=>card.classList.toggle('selected',card.dataset.taskId===id));
  renderTip(tasks||tasksFor(today()));
}
function toggleTaskDone(date,task){
  const current=loadChecks(date), ids=[task.id,...(task.aliases||[])];
  const normalized=ids.map(a=>a.replace(/\s/g,'_'));
  const pos=current.findIndex(x=>ids.includes(x)||normalized.includes(x));
  if(pos>=0)current.splice(pos,1);else current.push(task.id);
  saveChecks(date,current);
  renderToday();
}
function isMobileView(){return window.matchMedia&&window.matchMedia('(max-width: 760px)').matches}
function refreshMobilePin(){
  const pin=document.querySelector('.mobile-today-pin');
  if(pin)pin.classList.remove('show');
}
function renderQuickLinks(){
  const wrap=document.getElementById('quick-links'), links=exam().quickLinks||[];
  if(!links.length){wrap.innerHTML='';wrap.style.display='none';return}
  wrap.style.display='grid';
  wrap.innerHTML='<div class="quick-head"><div><div class="quick-title">快捷入口</div><div class="quick-sub">主页 / 课程 / 经验帖，直接点开</div></div></div><div class="quick-grid"></div>';
  const grid=wrap.querySelector('.quick-grid');
  links.forEach(group=>{
    const card=document.createElement('div');
    card.className='quick-group';
    const name=document.createElement('div');
    name.className='quick-name';
    name.textContent=group.name;
    const items=document.createElement('div');
    items.className='quick-items';
    (group.items||[]).forEach(item=>{
      const el=document.createElement(item.url?'a':'span');
      el.className='quick-link'+(item.url?'':' disabled');
      el.textContent=item.label;
      if(item.url){
        el.href=item.url;
        el.target='_blank';
        el.rel='noopener noreferrer';
      }
      items.appendChild(el);
    });
    card.append(name,items);
    grid.appendChild(card);
  });
}
function renderPrepHub(){
  const wrap=document.getElementById('prep-hub'), prep=exam().prep||[];
  if(!prep.length){wrap.innerHTML='';wrap.style.display='none';return}
  wrap.style.display='grid';
  wrap.innerHTML='<div class="quick-head"><div><div class="quick-title">考试准备大合集</div><div class="quick-sub" id="prep-save-status">自动保存：已开启</div></div></div><div class="prep-grid"></div>';
  const grid=wrap.querySelector('.prep-grid');
  prep.forEach(item=>{
    const card=document.createElement('div');
    card.className='prep-card';
    card.innerHTML=`<div class="prep-head"><div class="prep-title">${escapeHTML(item.title)}</div><button class="copy-btn" data-copy-id="${escapeHTML(item.id)}" onclick="copyPrep('${escapeHTML(item.id)}')">复制</button></div><textarea class="prep-text" id="prep-${escapeHTML(item.id)}" data-prep-id="${escapeHTML(item.id)}">${escapeHTML(loadPrep(item))}</textarea>`;
    grid.appendChild(card);
  });
  bindPrepAutosave();
}
function bindPrepAutosave(){
  document.querySelectorAll('.prep-text').forEach(el=>{
    el.addEventListener('input',()=>{
      savePrep(el.dataset.prepId,el.value);
      const status=document.getElementById('prep-save-status');
      if(status){
        status.textContent='自动保存：刚刚保存';
        clearTimeout(bindPrepAutosave.timer);
        bindPrepAutosave.timer=setTimeout(()=>status.textContent='自动保存：已开启',1200);
      }
    });
  });
}
function copyPrep(id){
  const el=document.getElementById('prep-'+id);
  if(!el)return;
  const text=el.value;
  const done=()=>{const btn=document.querySelector(`[data-copy-id="${id}"]`);if(btn){const old=btn.textContent;btn.textContent='已复制';setTimeout(()=>btn.textContent=old,900)}};
  if(navigator.clipboard&&window.isSecureContext){
    navigator.clipboard.writeText(text).then(done).catch(()=>{el.select();document.execCommand('copy');done()});
  }else{
    el.select();
    document.execCommand('copy');
    done();
  }
}
function renderStats(){
  const e=exam(), d=today(), start=parseDate(e.start), end=examEndDate(), last=d<end?d:end;
  let doneDays=0,curStreak=0,total=0,done=0;
  for(let day=start;day<=last;day=addDays(day,1)){
    const tasks=tasksFor(day), checks=loadChecks(day), c=countDone(tasks,checks);
    total+=tasks.length;done+=c;
    if(tasks.length&&c===tasks.length){doneDays++;curStreak++}else curStreak=0;
  }
  const todayTasks=tasksFor(d), todayDone=countDone(todayTasks,loadChecks(d));
  document.getElementById('s-done').textContent=doneDays;
  document.getElementById('s-left').textContent=Math.max(0,daysBetween(d,end));
  document.getElementById('s-streak').textContent=curStreak;
  document.getElementById('s-rate').textContent=`${todayDone}/${todayTasks.length}`;
  document.getElementById('pin-streak').textContent=curStreak;
  document.getElementById('pin-rate').textContent=`${todayDone}/${todayTasks.length}`;
}
function renderCalendar(){
  const e=exam(), grid=document.getElementById('cal-grid'), t=today(), end=examEndDate();
  const selected=parseDate(selectedCalKey);
  if(selected.getFullYear()!==calMonth.getFullYear()||selected.getMonth()!==calMonth.getMonth()){
    const inMonth=t.getFullYear()===calMonth.getFullYear()&&t.getMonth()===calMonth.getMonth();
    selectedCalKey=dayKey(inMonth?t:new Date(calMonth.getFullYear(),calMonth.getMonth(),1));
  }
  document.getElementById('cal-month').textContent=`${calMonth.getFullYear()}年${calMonth.getMonth()+1}月`;
  grid.innerHTML='';
  ['一','二','三','四','五','六','日'].forEach(x=>{const el=document.createElement('div');el.className='dow';el.textContent=x;grid.appendChild(el)});
  const first=(new Date(calMonth.getFullYear(),calMonth.getMonth(),1).getDay()+6)%7;
  const dim=new Date(calMonth.getFullYear(),calMonth.getMonth()+1,0).getDate();
  for(let i=0;i<first;i++){const el=document.createElement('div');el.className='day fade';grid.appendChild(el)}
  for(let n=1;n<=dim;n++){
    const date=new Date(calMonth.getFullYear(),calMonth.getMonth(),n), tasks=tasksFor(date), checks=loadChecks(date), c=countDone(tasks,checks);
    let cls='day';
    if(tasks.length&&c===tasks.length)cls+=' full';else if(c>0)cls+=' part';
    if(dayKey(date)===dayKey(t))cls+=' today';
    if(dayKey(date)===selectedCalKey)cls+=' selected';
    if(dayKey(date)===dayKey(end))cls+=' exam';
    const el=document.createElement('button');el.className=cls;el.textContent=n;el.onclick=()=>{selectedCalKey=dayKey(date);renderCalendar()};grid.appendChild(el);
  }
  document.getElementById('cal-info').innerHTML=calendarInfo(parseDate(selectedCalKey));
}
function calendarInfo(date){
  const tasks=tasksFor(date), checks=loadChecks(date), done=countDone(tasks,checks);
  const title=date.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'});
  if(!tasks.length)return `<strong>${escapeHTML(title)}</strong>该日无任务`;
  return `<strong>${escapeHTML(title)} · ${done}/${tasks.length} 完成</strong>${tasks.map(t=>(taskDone(t,checks)?'✓ ':'○ ')+escapeHTML(t.title)).join('　')}`;
}
function moveMonth(dir){calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()+dir,1);renderCalendar()}
function renderList(){
  const e=exam(), start=parseDate(e.start), end=examEndDate(), total=daysBetween(start,end), c=document.getElementById('list-container');
  c.innerHTML='<div class="section-title">里程碑</div>';
  const ms=e.phases.map((p,i)=>({date:addDays(start,Math.round(total*p.at)),name:p.name,desc:p.desc,type:i===e.phases.length-1?'exam':''}));
  const mgrid=document.createElement('div');mgrid.className='milestones';c.appendChild(mgrid);
  const t=today();
  ms.forEach(m=>{const type=m.type||((dayKey(m.date)===dayKey(t))?'today':m.date<t?'done':'');const card=document.createElement('div');card.className='panel';card.innerHTML=`<div class="panel-date">${m.date.toLocaleDateString('zh-CN',{month:'long',day:'numeric'})}</div><div class="panel-title">${escapeHTML(m.name)}</div><div class="panel-meta">${escapeHTML(m.desc)}</div><span class="pill ${type}">${type==='exam'?'终点':type==='today'?'今天':type==='done'?'已过':'待来'}</span>`;mgrid.appendChild(card)});
  c.insertAdjacentHTML('beforeend','<div class="section-title">每周进度</div>');
  const wgrid=document.createElement('div');wgrid.className='weeks';c.appendChild(wgrid);
  for(let i=0;i<=total;i+=7){
    const ws=addDays(start,i), we=addDays(start,Math.min(i+6,total));let all=0,done=0;
    for(let d=ws;d<=we;d=addDays(d,1)){const tasks=tasksFor(d);all+=tasks.length;done+=countDone(tasks,loadChecks(d))}
    const pct=all?Math.round(done/all*100):0, card=document.createElement('div');card.className='panel';card.innerHTML=`<div class="panel-title">第 ${Math.floor(i/7)+1} 周</div><div class="panel-meta">${ws.toLocaleDateString('zh-CN',{month:'short',day:'numeric'})} - ${we.toLocaleDateString('zh-CN',{month:'short',day:'numeric'})}</div><div class="week-progress"><span style="width:${pct}%"></span></div><div class="panel-meta">${done}/${all} 项完成</div>`;wgrid.appendChild(card);
  }
}
function renderPlan(){
  const e=exam(), start=parseDate(e.start), end=examEndDate(), total=daysBetween(start,end), cur=phaseIndex(today());
  const box=document.getElementById('plan-container');box.innerHTML='';
  e.phases.forEach((p,i)=>{const card=document.createElement('div');card.className='phase-card '+(i===cur?'active-phase':'inactive');const date=addDays(start,Math.round(total*p.at));card.innerHTML=`<h3>${escapeHTML(p.name)}</h3><time>${date.toLocaleDateString('zh-CN',{month:'long',day:'numeric'})}</time><p>${escapeHTML(p.desc)}</p>`;box.appendChild(card)});
  const res=document.getElementById('resource-container');res.innerHTML='';e.resources.forEach(r=>{const el=document.createElement('span');el.className='res-tag';el.textContent=r;res.appendChild(el)});
}
function supabaseConfigured(){return Boolean(SUPABASE_CONFIG.url&&SUPABASE_CONFIG.anonKey&&window.supabase)}
function notify(message,type='good',title='提示'){
  const stack=document.getElementById('toast-stack');
  if(!stack){console.log(message);return}
  const key=`${type}:${title}:${message}`;
  const old=toastState.get(key);
  if(old){
    old.count+=1;
    old.el.classList.add('multi','bump');
    old.el.querySelector('.toast-count').textContent=`×${old.count}`;
    clearTimeout(old.timer);
    old.timer=setTimeout(()=>dismissToast(key),3200);
    setTimeout(()=>old.el.classList.remove('bump'),260);
    return;
  }
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.innerHTML=`<div class="toast-title">${escapeHTML(title)}</div><div class="toast-msg">${escapeHTML(message)}</div><div class="toast-count">×1</div>`;
  stack.appendChild(el);
  const timer=setTimeout(()=>dismissToast(key),3200);
  toastState.set(key,{el,count:1,timer});
}
function dismissToast(key){
  const item=toastState.get(key);
  if(!item)return;
  item.el.style.animation='toastOut .18s ease both';
  setTimeout(()=>item.el.remove(),180);
  toastState.delete(key);
}
function askConfirm(message,title='确认操作'){
  return new Promise(resolve=>{
    const layer=document.getElementById('confirm-layer');
    const card=document.getElementById('confirm-card');
    const titleEl=document.getElementById('confirm-title');
    const msgEl=document.getElementById('confirm-message');
    const ok=document.getElementById('confirm-ok');
    const cancel=document.getElementById('confirm-cancel');
    if(!layer||!ok||!cancel){resolve(window.confirm(message));return}
    card?.classList.remove('sync-card');
    document.getElementById('sync-merge')?.remove();
    titleEl.textContent=title;
    msgEl.textContent=message;
    ok.textContent='确认';
    cancel.textContent='取消';
    ok.classList.add('danger-btn');
    layer.classList.add('open');
    const close=value=>{
      layer.classList.remove('open');
      ok.onclick=null;
      cancel.onclick=null;
      resolve(value);
    };
    ok.onclick=()=>close(true);
    cancel.onclick=()=>close(false);
    layer.onclick=ev=>{if(ev.target===layer)close(false)};
  });
}
function askSyncConflict(local,remote){
  return new Promise(resolve=>{
    const layer=document.getElementById('confirm-layer');
    const card=document.getElementById('confirm-card');
    const titleEl=document.getElementById('confirm-title');
    const msgEl=document.getElementById('confirm-message');
    const ok=document.getElementById('confirm-ok');
    const cancel=document.getElementById('confirm-cancel');
    const actions=card?.querySelector('.confirm-actions');
    if(!layer||!ok||!cancel){resolve(window.confirm('检测到本机和云端数据不一致。确认保留本机？取消则保留云端。')?'local':'remote');return}
    document.getElementById('sync-merge')?.remove();
    const mergeBtn=document.createElement('button');
    mergeBtn.className='plain-btn merge-btn';
    mergeBtn.id='sync-merge';
    mergeBtn.textContent='合并';
    actions?.insertBefore(mergeBtn,ok);
    const stats=syncDiffStats(local,remote);
    const kinds=['打卡','大合集','考试时间','设置'].map(kind=>{
      const row=stats.kinds[kind]||{local:0,remote:0,diff:0};
      return `<div class="sync-kind"><b>${kind}</b><span>本机 ${row.local}</span><span>云端 ${row.remote}</span><em>${row.diff} 项不一致</em></div>`;
    }).join('');
    const rows=stats.diffs.map(item=>`
      <div class="sync-data-row">
        <div class="sync-data-head"><b>${escapeHTML(item.key)}</b><em>${escapeHTML(item.type)}</em></div>
        <div class="sync-data-cols">
          <div><span>本机</span><p>${escapeHTML(syncValuePreview(item.key,item.local))}</p></div>
          <div><span>云端</span><p>${escapeHTML(syncValuePreview(item.key,item.remote))}</p></div>
        </div>
      </div>
    `).join('');
    card?.classList.add('sync-card');
    titleEl.textContent='同步冲突';
    msgEl.innerHTML=`
      <div class="sync-simple">
        <div class="sync-side local"><span>本机</span><strong>${stats.localTotal}</strong><em>当前浏览器</em></div>
        <div class="sync-vs">不同步</div>
        <div class="sync-side remote"><span>云端</span><strong>${stats.remoteTotal}</strong><em>Supabase</em></div>
      </div>
      <div class="sync-plain">
        检测到 <b>${stats.diffTotal}</b> 项不一致。推荐先点“合并”：打卡会合到一起，大合集会保留两边内容。
      </div>
      <button class="sync-toggle" type="button" id="sync-detail-toggle">展开详细</button>
      <div class="sync-detail" id="sync-detail">
        <div class="sync-help">
          <b>本机独有</b>：只存在于这台设备。<br>
          <b>云端独有</b>：只存在于 Supabase。<br>
          <b>同名不同</b>：两边都有同一条记录，但内容不一样。
        </div>
        <div class="sync-breakdown">
          <div><b>${stats.localOnly}</b><span>本机独有</span></div>
          <div><b>${stats.remoteOnly}</b><span>云端独有</span></div>
          <div><b>${stats.changed}</b><span>同名不同</span></div>
        </div>
        <div class="sync-kinds">${kinds}</div>
        <div class="sync-data-list">${rows||'<div class="sync-help">没有不同的数据项。</div>'}</div>
      </div>
    `;
    msgEl.querySelector('#sync-detail-toggle')?.addEventListener('click',ev=>{
      const detail=msgEl.querySelector('#sync-detail');
      const open=detail?.classList.toggle('open');
      ev.currentTarget.textContent=open?'收起详细':'展开详细';
    });
    ok.textContent='保留本机';
    cancel.textContent='保留云端';
    ok.classList.remove('danger-btn');
    layer.classList.add('open');
    const close=value=>{
      layer.classList.remove('open');
      card?.classList.remove('sync-card');
      mergeBtn.remove();
      ok.onclick=null;
      cancel.onclick=null;
      mergeBtn.onclick=null;
      layer.onclick=null;
      resolve(value);
    };
    mergeBtn.onclick=()=>close('merge');
    ok.onclick=()=>close('local');
    cancel.onclick=()=>close('remote');
    layer.onclick=ev=>{if(ev.target===layer)close('remote')};
  });
}
function setCloudStatus(text){
  const account=document.getElementById('account-status');
  const auth=document.getElementById('auth-status');
  if(account)account.textContent=text;
  if(auth)auth.textContent=text;
}
function authRedirectTo(){return location.origin+location.pathname}
function cloudCredentials(source='account'){
  const prefix=source==='auth'?'auth':'account';
  return {
    email:document.getElementById(`${prefix}-email`)?.value.trim(),
    password:document.getElementById(`${prefix}-password`)?.value,
  };
}
function offlineMode(){return localStorage.getItem('offline_mode')==='1'}
function canEnterApp(){return Boolean(cloudUser)||offlineMode()}
function renderAuthGate(){document.body.classList.toggle('auth-required',!canEnterApp());document.body.classList.toggle('offline-mode',offlineMode()&&!cloudUser)}
function useOfflineMode(){localStorage.setItem('offline_mode','1');renderAccount();renderAll()}
function exitOfflineMode(){localStorage.removeItem('offline_mode');closeAccountPanel();renderAccount();notify('已回到登录入口','good','离线模式已退出')}
async function afterCloudLogin(options={}){
  localStorage.removeItem('offline_mode');
  renderSettings();
  if(!cloudBootstrapped)await bootstrapCloudSync(options.mode||'ask');
}
async function initCloud(){
  if(!supabaseConfigured()){setCloudStatus('Supabase 未配置');return}
  cloudClient=window.supabase.createClient(SUPABASE_CONFIG.url,SUPABASE_CONFIG.anonKey,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });
  cloudClient.auth.onAuthStateChange((event,session)=>{
    cloudUser=session?.user||null;
    if(event==='PASSWORD_RECOVERY'){
      passwordRecoveryMode=true;
      document.getElementById('account-panel')?.classList.add('open');
    }
    renderSettings();
  });
  const params=new URLSearchParams(location.search);
  const hasAuthCallback=params.has('code')||location.hash.includes('access_token')||location.hash.includes('type=');
  if(params.has('code')){
    const {error}=await cloudClient.auth.exchangeCodeForSession(params.get('code'));
    if(!error)history.replaceState({},document.title,location.pathname);
  }
  const {data}=await cloudClient.auth.getSession();
  cloudUser=data.session?.user||null;
  if(cloudUser)await afterCloudLogin({mode:hasAuthCallback?'ask':'cloud'});else renderSettings();
}
function cloudReady(){
  if(!cloudClient){notify('Supabase 还没配置。先把 Project URL 和 anon key 填到 app.js 的 SUPABASE_CONFIG。','bad','云端不可用');return false}
  if(!cloudUser){notify('请先用邮箱登录云端账号。','warn','还没登录');return false}
  return true;
}
async function loginCloud(source='account'){
  if(!cloudClient){notify('Supabase 还没配置。','bad','云端不可用');return}
  const {email}=cloudCredentials(source);
  if(!email){notify('先输入邮箱','warn','缺少邮箱');return}
  const {error}=await cloudClient.auth.signInWithOtp({email,options:{emailRedirectTo:authRedirectTo()}});
  if(error){notify(error.message,'bad','发送失败');return}
  notify('登录链接已发送，去邮箱点一下。','good','邮件已发送');
}
async function signupPassword(source='account'){
  if(!cloudClient){notify('Supabase 还没配置。','bad','云端不可用');return}
  const {email,password}=cloudCredentials(source);
  if(!email||!password){notify('请输入邮箱和密码','warn','信息不完整');return}
  if(password.length<6){notify('密码至少 6 位','warn','密码太短');return}
  const {data,error}=await cloudClient.auth.signUp({email,password,options:{emailRedirectTo:authRedirectTo()}});
  if(error){notify(error.message,'bad','注册失败');return}
  cloudUser=data.session?.user||cloudUser;
  if(cloudUser)await afterCloudLogin({mode:'ask'});else renderSettings();
  notify(data.session?'注册成功，已登录。':'注册邮件已发送，去邮箱确认后再登录。','good','注册成功');
}
async function loginPassword(source='account'){
  if(!cloudClient){notify('Supabase 还没配置。','bad','云端不可用');return}
  const {email,password}=cloudCredentials(source);
  if(!email||!password){notify('请输入邮箱和密码','warn','信息不完整');return}
  const {data,error}=await cloudClient.auth.signInWithPassword({email,password});
  if(error){notify(error.message,'bad','登录失败');return}
  cloudUser=data.session?.user||null;
  passwordRecoveryMode=false;
  if(cloudUser)await afterCloudLogin({mode:'ask'});else renderSettings();
  notify('欢迎回来，今天继续推进。','good','登录成功');
}
async function setCloudPassword(){
  if(!cloudClient){notify('Supabase 还没配置。','bad','云端不可用');return}
  if(!cloudUser){notify('请先通过邮箱链接登录，或打开忘记密码邮件后再设置新密码。','warn','还没登录');return}
  if(!passwordRecoveryMode){
    passwordRecoveryMode=true;
    renderAccount();
    notify('输入新密码后，再点一次“重设密码”。','good','准备重设密码');
    return;
  }
  const email=cloudUser.email;
  const {password}=cloudCredentials('account');
  if(!password){notify('请输入新密码','warn','缺少密码');return}
  if(password.length<6){notify('密码至少 6 位','warn','密码太短');return}
  const {error}=await cloudClient.auth.updateUser({password});
  if(error){notify(error.message,'bad','设置失败');return}
  const {error:logoutError}=await cloudClient.auth.signOut();
  if(logoutError){notify(logoutError.message,'bad','验证失败');return}
  const {data,error:loginError}=await cloudClient.auth.signInWithPassword({email,password});
  if(loginError){cloudUser=null;renderSettings();notify(`密码已提交，但自动验证失败：${loginError.message}`,'bad','验证失败');return}
  cloudUser=data.session?.user||null;
  passwordRecoveryMode=false;
  await afterCloudLogin({mode:'cloud'});
  notify('以后可以直接密码登录。','good','密码已验证');
}
async function resetCloudPassword(source='account'){
  if(!cloudClient){notify('Supabase 还没配置。','bad','云端不可用');return}
  const {email}=cloudCredentials(source);
  if(!email){notify('先输入邮箱','warn','缺少邮箱');return}
  const {error}=await cloudClient.auth.resetPasswordForEmail(email,{redirectTo:authRedirectTo()});
  if(error){notify(error.message,'bad','发送失败');return}
  notify('打开邮件后回到这里输入新密码，再点“设置密码”。','good','重置邮件已发送');
}
async function logoutCloud(){
  if(!cloudClient)return;
  await cloudClient.auth.signOut();
  cloudUser=null;
  cloudBootstrapped=false;
  passwordRecoveryMode=false;
  localStorage.removeItem('offline_mode');
  renderSettings();
}
async function syncKeyToCloud(key){
  if(!cloudClient||!cloudUser||cloudBusy||!syncableKey(key))return;
  const raw=localStorage.getItem(key);
  if(raw===null)return;
  await cloudClient.from('study_store').upsert({
    user_id:cloudUser.id,
    key,
    value:{raw},
  },{onConflict:'user_id,key'});
}
async function uploadItemsToCloud(items){
  const rows=Object.entries(items).map(([key,raw])=>({user_id:cloudUser.id,key,value:{raw}}));
  if(!rows.length)return {count:0};
  const {error}=await cloudClient.from('study_store').upsert(rows,{onConflict:'user_id,key'});
  return {error,count:rows.length};
}
async function replaceCloudWithItems(items){
  const {error:deleteError}=await cloudClient.from('study_store').delete().eq('user_id',cloudUser.id);
  if(deleteError)return {error:deleteError,count:0};
  return uploadItemsToCloud(items);
}
function replaceLocalWithItems(items){
  Object.keys(syncableItems()).forEach(key=>localStorage.removeItem(key));
  Object.entries(items).forEach(([key,raw])=>localStorage.setItem(key,raw));
  activeExamId=localStorage.getItem('active_exam')||activeExamId;
}
async function bootstrapCloudSync(mode='ask'){
  if(!cloudClient||!cloudUser||cloudBusy)return;
  cloudBootstrapped=true;
  cloudBusy=true;
  const local=syncableItems();
  const {data,error}=await cloudClient.from('study_store').select('key,value').eq('user_id',cloudUser.id);
  if(error){cloudBusy=false;notify(error.message,'bad','同步失败');return}
  const remote=cloudRawMap(data);
  if(mode==='cloud'){
    replaceLocalWithItems(remote);
    cloudBusy=false;
    renderAll();
    notify('已读取云端最新数据。','good','云端已同步');
    return;
  }
  if(!Object.keys(remote).length){
    const result=await uploadItemsToCloud(local);
    cloudBusy=false;
    if(result.error)notify(result.error.message,'bad','同步失败');else notify(`已保存 ${result.count} 条本机数据到云端`,'good','已自动同步');
    return;
  }
  if(mapsEqual(local,remote)){
    cloudBusy=false;
    notify('本机和云端已经一致','good','已自动同步');
    return;
  }
  cloudBusy=false;
  const action=await askSyncConflict(local,remote);
  cloudBusy=true;
  if(action==='local'){
    const result=await replaceCloudWithItems(local);
    if(result.error)notify(result.error.message,'bad','同步失败');else notify('已保留本机并覆盖云端。','good','同步完成');
  }else if(action==='merge'){
    const merged=mergeSyncItems(local,remote);
    const result=await replaceCloudWithItems(merged);
    if(result.error)notify(result.error.message,'bad','同步失败');
    else{
      replaceLocalWithItems(merged);
      notify('已合并本机和云端数据。','good','同步完成');
      renderAll();
    }
  }else{
    replaceLocalWithItems(remote);
    notify('已恢复云端数据。','good','同步完成');
    renderAll();
  }
  cloudBusy=false;
}
async function uploadCloud(){
  if(!cloudReady())return;
  cloudBusy=true;
  const result=await replaceCloudWithItems(syncableItems());
  cloudBusy=false;
  if(result.error){notify(result.error.message,'bad','上传失败');return}
  notify(`已上传 ${result.count} 条本机数据`,'good','上传完成');
}
async function downloadCloud(){
  if(!cloudReady())return;
  if(!await askConfirm('确认用云端数据覆盖当前浏览器本地数据？','恢复云端'))return;
  cloudBusy=true;
  const {data,error}=await cloudClient.from('study_store').select('key,value').eq('user_id',cloudUser.id);
  if(error){cloudBusy=false;notify(error.message,'bad','恢复失败');return}
  replaceLocalWithItems(cloudRawMap(data));
  cloudBusy=false;
  notify(`已恢复 ${data?.length||0} 条云端数据`,'good','恢复完成');
  renderAll();
}
function renderSettings(){
  const theme=localStorage.getItem('theme')||'auto';
  ['auto','light','dark'].forEach(t=>document.getElementById('th-'+t).classList.toggle('active',theme===t));
  const timeInput=document.getElementById('exam-time-input');
  const timeTitle=document.getElementById('exam-time-title');
  const timeSub=document.getElementById('exam-time-sub');
  if(timeInput)timeInput.value=getExamDateTimeValue();
  if(timeTitle)timeTitle.textContent=`${exam().name} 考试时间`;
  if(timeSub)timeSub.textContent=`当前：${examDateText()}。默认：${defaultExamDateText()}。改动后会同步到云端。`;
  const storage=document.getElementById('storage-status');
  if(storage)storage.textContent=cloudUser?'localStorage + Supabase 云端同步':'localStorage，本机本浏览器记录。配置 Supabase 后可云端同步。';
  renderAccount();
}
function renderAccount(){
  document.body.classList.toggle('cloud-logged-in',Boolean(cloudUser));
  document.body.classList.toggle('password-recovery',passwordRecoveryMode);
  renderAuthGate();
  const btn=document.getElementById('account-toggle');
  if(btn){
    btn.classList.toggle('signed-in',Boolean(cloudUser));
    btn.textContent=cloudUser?'已登录':offlineMode()?'离线':'账号';
  }
  if(!supabaseConfigured())setCloudStatus('Supabase 未配置');
  else if(cloudUser&&passwordRecoveryMode)setCloudStatus(`密码重置中：${cloudUser.email}，输入新密码后点“设置密码”`);
  else if(cloudUser)setCloudStatus(`已登录：${cloudUser.email}`);
  else if(offlineMode())setCloudStatus('离线模式：只保存在当前浏览器');
  else setCloudStatus('Supabase 已配置，尚未登录');
}
function toggleAccountPanel(){
  document.getElementById('account-panel')?.classList.toggle('open');
}
function closeAccountPanel(){
  document.getElementById('account-panel')?.classList.remove('open');
}
function setExamTime(value){
  if(!value)return;
  const key=examTimeKey();
  localStorage.setItem(key,value);
  syncKeyToCloud(key);
  notify(`${exam().name} 已改为 ${examDateText()}`,'good','考试时间已保存');
  renderAll();
}
function resetExamTime(){
  const key=examTimeKey();
  localStorage.setItem(key,defaultExamDateTime());
  syncKeyToCloud(key);
  notify(`${exam().name} 已恢复默认时间`,'good','考试时间已保存');
  renderAll();
}
function setTheme(t){localStorage.setItem('theme',t);syncKeyToCloud('theme');applyTheme(t);renderSettings()}
function applyTheme(t){
  if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);
  const btn=document.getElementById('theme-toggle-btn');
  if(!btn)return;
  if(t==='auto'){
    btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id="theme-half"><rect x="12" y="2" width="10" height="20"/></clipPath></defs><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="8" clip-path="url(#theme-half)" fill="currentColor" stroke="none"/><path d="M12 2v20"/></svg>';
    btn.setAttribute('aria-label','当前：自动主题');
  }else{
    btn.textContent=t==='light'?'☀':'☾';
    btn.setAttribute('aria-label',t==='light'?'当前：浅色主题':'当前：深色主题');
  }
}
function cycleTheme(){const cur=localStorage.getItem('theme')||'auto', order=['auto','light','dark'];setTheme(order[(order.indexOf(cur)+1)%3])}
function exportData(){const data={activeExamId,items:syncableItems()};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='study-kanban-backup.json';a.click()}
function importData(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{try{const data=JSON.parse(ev.target.result);Object.entries(data.items||{}).forEach(([k,v])=>{if(syncableKey(k))localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v))});notify('导入成功','good','已恢复备份');renderAll()}catch{notify('文件格式错误','bad','导入失败')}};reader.readAsText(file)}
async function clearData(){if(!await askConfirm(`确认清除 ${exam().name} 的打卡记录和大合集内容？`,'清除当前考试'))return;const prefixes=[`checks_${activeExamId}_`,`prep_${activeExamId}_`];const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(prefixes.some(p=>k.startsWith(p)))keys.push(k)}keys.forEach(k=>localStorage.removeItem(k));if(cloudClient&&cloudUser&&keys.length){await cloudClient.from('study_store').delete().eq('user_id',cloudUser.id).in('key',keys)}notify('当前考试数据已清除','good','清除完成');renderAll()}

applyTheme(localStorage.getItem('theme')||'auto');
initCloud();
renderAll();
countdownTimer=setInterval(updateCountdown,1000);
window.addEventListener('scroll',refreshMobilePin,{passive:true});
document.addEventListener('scroll',refreshMobilePin,{passive:true,capture:true});
window.addEventListener('resize',refreshMobilePin);
if(window.visualViewport){visualViewport.addEventListener('scroll',refreshMobilePin,{passive:true});visualViewport.addEventListener('resize',refreshMobilePin)}
if(window.matchMedia){matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if((localStorage.getItem('theme')||'auto')==='auto')applyTheme('auto')})}
