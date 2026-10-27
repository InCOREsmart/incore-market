export type VerticalId = 'efficiency' | 'sales' | 'projects' | 'digital' | 'hr' | 'management';
export type TaskStatus = 'open' | 'reviewing' | 'contracting' | 'in_progress' | 'acceptance' | 'completed' | 'disputed' | 'cancelled';
export type ContractStatus = 'draft' | 'proposed' | 'active' | 'submitted' | 'accepted' | 'disputed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'submitted' | 'accepted' | 'rejected';

export interface Vertical {
  id: VerticalId; label: string; eyebrow: string; description: string; categories: string[];
}
export interface Milestone {
  id: string; title: string; amount: number; due: string; criteria: string; status: MilestoneStatus; evidence?: string;
}
export interface MarketTask {
  id: string; title: string; vertical: VerticalId; category: string; company: string; description: string;
  outcome: string; criteria: string[]; budget: number; days: number; skills: string[]; status: TaskStatus;
  proposals: Proposal[]; contract?: WorkContract; createdAt: string;
}
export interface Proposal {
  id: string; specialist: string; headline: string; pitch: string; price: number; days: number;
  skills: string[]; score: number; createdAt: string;
}
export interface WorkContract {
  id: string; version: number; status: ContractStatus; client: string; specialist: string; amount: number;
  scope: string; acceptanceCriteria: string[]; milestones: Milestone[]; events: ContractEvent[];
}
export interface ContractEvent {
  id: string; at: string; actor: string; type: string; detail: string; version: number;
}
export const verticals: Vertical[] = [
  { id:'efficiency', label:'Эффективность бизнеса', eyebrow:'P&L / OPERATIONS', description:'Находим потери, высвобождаем ресурсы и связываем оплату с измеримым эффектом.', categories:['Оптимизация ФОТ','Производительность','Оргдизайн','Потери процессов','Автоматизация'] },
  { id:'sales', label:'Управление продажами', eyebrow:'REVENUE / SALES', description:'Воронка, конверсия и коммерческие процессы с понятными метриками результата.', categories:['Аудит воронки','Рост конверсии','CRM и процессы','Развитие команды'] },
  { id:'projects', label:'Проектное управление', eyebrow:'DELIVERY / PMO', description:'Сроки, этапы, риски и поставка результата без бесконечных статусов ради статусов.', categories:['Запуск проекта','Антикризисный PM','PMO','Сроки и риски'] },
  { id:'digital', label:'Цифровизация процессов', eyebrow:'AUTOMATION / DIGITAL', description:'Убираем ручной труд, связываем системы и проверяем эффект автоматизации.', categories:['Аудит процессов','Интеграции','No-code / low-code','AI-автоматизация'] },
  { id:'hr', label:'HR и люди', eyebrow:'PEOPLE / TALENT', description:'Подбор, адаптация и развитие через результат работы, а не только красивое резюме.', categories:['Подбор','Адаптация','Оценка компетенций','Обучение'] },
  { id:'management', label:'Управленческие задачи', eyebrow:'STRATEGY / CHANGE', description:'Диагностика и изменения для руководителей, которым нужны решения и исполнение.', categories:['Стратегия','Оргтрансформация','Операционная модель','Управленческая аналитика'] },
];
export const statusLabel: Record<TaskStatus,string> = {
  open:'Открыта', reviewing:'Выбор исполнителя', contracting:'Согласование условий', in_progress:'В работе', acceptance:'Приёмка результата', completed:'Завершена', disputed:'Спор'
};
export const contractStatusLabel: Record<ContractStatus,string> = {
  draft:'Черновик', proposed:'Условия предложены', active:'В работе', submitted:'На приёмке', accepted:'Принят', disputed:'Спор', cancelled:'Отменён'
};
const now = new Date().toISOString();
const proposal = (id:string,specialist:string,headline:string,pitch:string,price:number,days:number,skills:string[],score:number):Proposal => ({id,specialist,headline,pitch,price,days,skills,score,createdAt:now});
export const seedTasks: MarketTask[] = [
 { id:'task-101', title:'Снизить рост ФОТ без потери производительности', vertical:'efficiency', category:'Оптимизация ФОТ', company:'Производственная компания · 420 сотрудников', description:'За год ФОТ вырос на 24%, выручка на 8%. Нужна диагностика причин и план изменений с расчётом эффекта по подразделениям.', outcome:'Согласованный план мер с финансовой моделью и владельцами внедрения.', criteria:['Базовая линия ФОТ и производительности за 12 месяцев','Не менее 3 сценариев с рисками и сроком эффекта','Расчёт эффекта по каждому мероприятию и допущениям','Защита результатов перед CEO и CFO'], budget:480000, days:25, skills:['ФОТ','финансовая модель','оргдизайн','операционная эффективность'], status:'open', proposals:[proposal('p-101','Анна М.','Оргдизайн и экономика труда','Начну с разложения роста ФОТ на численность, ставки, сверхурочные и структуру. Отделю подтверждённый эффект от гипотез.',420000,22,['ФОТ','оргдизайн','финансовая модель'],94),proposal('p-102','Команда Northstar','Операционная эффективность','Проведём диагностику по функциям, построим сценарии и дорожную карту внедрения с владельцами KPI.',460000,25,['производительность','процессы','KPI'],89)],createdAt:now },
 { id:'task-102', title:'Поднять конверсию квалифицированных лидов в сделки', vertical:'sales', category:'Рост конверсии', company:'B2B SaaS · 65 сотрудников', description:'Лиды поступают, но теряются после первой встречи. Нужны диагностика воронки, правила квалификации и работающий цикл контроля.', outcome:'Утверждённый процесс продаж и измеримая динамика конверсии на согласованной выборке.', criteria:['Разметка причин потерь минимум за 90 дней','Новая модель этапов и критериев перехода','Скрипт квалификации и дашборд руководителя','План эксперимента с контрольной метрикой'], budget:260000, days:30, skills:['B2B продажи','CRM','аналитика','управление командой'], status:'open', proposals:[proposal('p-201','Илья К.','Revenue operations','Сначала проверю качество данных и распределение потерь по этапам. Изменения закрепим в CRM и ритме руководителя.',240000,28,['CRM','аналитика','B2B продажи'],91)],createdAt:now },
 { id:'task-103', title:'Сократить ручную обработку заявок на 40%', vertical:'digital', category:'Автоматизация', company:'Сервисная сеть · 12 филиалов', description:'Заявки проходят через почту и таблицы. Нужно описать процесс, убрать повторный ввод и запустить измеримый пилот.', outcome:'Рабочий процесс автоматизации с логированием и инструкцией для команды.', criteria:['Карта текущего и целевого процесса','Пилот на одном типе заявок','Замер времени до и после','Инструкция и план масштабирования'], budget:310000, days:35, skills:['BPMN','интеграции','автоматизация','change management'], status:'open', proposals:[],createdAt:now },
 { id:'task-104', title:'Запустить проектный офис для трёх ключевых инициатив', vertical:'projects', category:'PMO', company:'Дистрибуция · 800 сотрудников', description:'Инициативы конкурируют за ресурсы, сроки постоянно сдвигаются. Нужны общий контур управления и раннее выявление рисков.', outcome:'Работающий ритм проектного управления и единый портфель инициатив.', criteria:['Единый шаблон целей и этапов','Матрица ответственности и ресурсов','Реестр рисков с владельцами','Проведены два цикла портфельного обзора'], budget:390000, days:40, skills:['PMO','управление рисками','портфель проектов'], status:'open', proposals:[],createdAt:now },
 { id:'task-105', title:'Сократить время выхода новых сотрудников на план', vertical:'hr', category:'Адаптация', company:'Розничная сеть · 90 точек', description:'Новые сотрудники достигают нормы слишком поздно. Требуется обновить адаптацию и доказать эффект на выбранных ролях.', outcome:'Система адаптации с метриками выхода на производительность.', criteria:['Базовая линия time-to-productivity','Маршрут адаптации по ролям','Чек-листы руководителя и новичка','Пилотная оценка результата и рекомендации'], budget:220000, days:30, skills:['HR analytics','адаптация','обучение руководителей'], status:'open', proposals:[],createdAt:now },
 { id:'task-106', title:'Пересобрать операционную модель после роста', vertical:'management', category:'Операционная модель', company:'Финансовые услуги · 230 сотрудников', description:'Компания выросла, решения замедлились, зоны ответственности пересекаются. Нужна целевая модель управления.', outcome:'Согласованная операционная модель и план перехода на 90 дней.', criteria:['Карта ключевых решений и задержек','Целевые роли и права принятия решений','Показатели управления и эскалации','План перехода с рисками и ответственными'], budget:520000, days:45, skills:['операционная модель','стратегия','изменения'], status:'open', proposals:[],createdAt:now },
];
export const transitionMap: Record<ContractStatus,ContractStatus[]> = {
 draft:['proposed','cancelled'], proposed:['active','cancelled'], active:['submitted','disputed','cancelled'], submitted:['accepted','disputed','active'], accepted:[], disputed:['active','accepted','cancelled'], cancelled:[]
};
export function canTransition(from:ContractStatus,to:ContractStatus):boolean { return transitionMap[from].includes(to); }
export function money(value:number):string { return new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(value); }
