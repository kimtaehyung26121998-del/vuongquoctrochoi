import {QUESTIONS,type Question} from '../../data/questions'

// Giữ nguyên 12 câu luyện webcam; câu dự phòng chỉ dành cho màn Boss.
export const BOSS_QUESTIONS:Question[]=[
  ...QUESTIONS.filter(question=>question.stage===3),
  {id:'boss04',stage:3,prompt:'46 + 28 = ?',choices:{A:'74',B:'64',C:'84',D:'72'},answer:'A',explanation:'46 + 20 = 66; 66 + 8 = 74.'},
  {id:'boss05',stage:3,prompt:'83 − 26 = ?',choices:{A:'67',B:'57',C:'63',D:'47'},answer:'B',explanation:'83 − 20 = 63; 63 − 6 = 57.'},
  {id:'boss06',stage:3,prompt:'5 × 4 = ?',choices:{A:'9',B:'16',C:'20',D:'25'},answer:'C',explanation:'5 + 5 + 5 + 5 = 20.'},
  {id:'boss07',stage:3,prompt:'1 giờ bằng bao nhiêu phút?',choices:{A:'30',B:'100',C:'24',D:'60'},answer:'D',explanation:'1 giờ = 60 phút.'},
  {id:'boss08',stage:3,prompt:'Số nào lớn nhất?',choices:{A:'92',B:'79',C:'89',D:'82'},answer:'A',explanation:'92 có 9 chục, lớn hơn các số có 7 hoặc 8 chục.'},
  {id:'boss09',stage:3,prompt:'Lan có 35 nhãn vở, tặng bạn 17 nhãn vở. Lan còn bao nhiêu nhãn vở?',choices:{A:'22',B:'18',C:'28',D:'12'},answer:'B',explanation:'35 − 10 = 25; 25 − 7 = 18 nhãn vở.'},
]
