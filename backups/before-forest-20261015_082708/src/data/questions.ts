export type Choice = 'A' | 'B' | 'C' | 'D'
export type StageIndex = 0 | 1 | 2 | 3
export interface Question {
  id: string
  stage: StageIndex
  prompt: string
  choices: Record<Choice, string>
  answer: Choice
  explanation: string
}

export const STAGES = [
  { name: 'Rừng phép tính', asset: '/assets/backgrounds/01_forest.png', gem: '/assets/items/crystal_blue.png' },
  { name: 'Cầu vồng thử thách', asset: '/assets/backgrounds/02_rainbow.png', gem: '/assets/items/crystal_pink.png' },
  { name: 'Đảo kho báu', asset: '/assets/backgrounds/03_island.png', gem: '/assets/items/crystal_yellow.png' },
  { name: 'Lâu đài Boss', asset: '/assets/backgrounds/04_castle.png', gem: '/assets/items/crystal_green.png' },
] as const

export const QUESTIONS: Question[] = [
  {id:'q01',stage:0,prompt:'38 + 27 = ?',choices:{A:'65',B:'55',C:'75',D:'64'},answer:'A',explanation:'38 + 20 = 58; 58 + 7 = 65.'},
  {id:'q02',stage:0,prompt:'90 − 46 = ?',choices:{A:'54',B:'44',C:'46',D:'34'},answer:'B',explanation:'90 − 40 = 50; 50 − 6 = 44.'},
  {id:'q03',stage:0,prompt:'Số nào lớn nhất?',choices:{A:'68',B:'76',C:'86',D:'78'},answer:'C',explanation:'86 có 8 chục, lớn nhất trong các số đã cho.'},
  {id:'q04',stage:1,prompt:'24 + ☐ = 60',choices:{A:'26',B:'46',C:'34',D:'36'},answer:'D',explanation:'60 − 24 = 36.'},
  {id:'q05',stage:1,prompt:'Trong các số sau, số nào bé nhất?',choices:{A:'39',B:'93',C:'49',D:'59'},answer:'A',explanation:'39 có 3 chục, ít nhất.'},
  {id:'q06',stage:1,prompt:'7 × 3 = ?',choices:{A:'24',B:'21',C:'18',D:'27'},answer:'B',explanation:'7 + 7 + 7 = 21.'},
  {id:'q07',stage:2,prompt:'1 mét bằng bao nhiêu xăng-ti-mét?',choices:{A:'10',B:'1',C:'100',D:'1000'},answer:'C',explanation:'1 m = 100 cm.'},
  {id:'q08',stage:2,prompt:'Một tuần có bao nhiêu ngày?',choices:{A:'5',B:'6',C:'8',D:'7'},answer:'D',explanation:'Một tuần có 7 ngày.'},
  {id:'q09',stage:2,prompt:'Mai có 28 viên bi, được tặng thêm 14 viên. Mai có tất cả bao nhiêu viên bi?',choices:{A:'42',B:'32',C:'44',D:'41'},answer:'A',explanation:'28 + 14 = 42 (viên bi).'},
  {id:'q10',stage:3,prompt:'100 − 37 = ?',choices:{A:'73',B:'63',C:'67',D:'53'},answer:'B',explanation:'100 − 30 = 70; 70 − 7 = 63.'},
  {id:'q11',stage:3,prompt:'Hình tứ giác có mấy cạnh?',choices:{A:'3',B:'5',C:'4',D:'6'},answer:'C',explanation:'Hình tứ giác có 4 cạnh.'},
  {id:'q12',stage:3,prompt:'Có 5 nhóm, mỗi nhóm 4 bạn. Có tất cả bao nhiêu bạn?',choices:{A:'9',B:'25',C:'15',D:'20'},answer:'D',explanation:'5 × 4 = 20 (bạn).'},
]
