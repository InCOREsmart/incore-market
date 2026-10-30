import { supabase } from './supabase';
import type { MarketTask, Proposal, TaskStatus, VerticalId } from '../domain';

type TaskRow = {
  id:string; title:string; vertical:VerticalId; category:string; company_name:string;
  description:string; outcome:string; acceptance_criteria:unknown; budget_minor:number;
  target_days:number; required_skills:string[]; status:TaskStatus; created_at:string;
  created_by:string;
};
type ProposalRow = {
  id:string; task_id:string; specialist_id:string; headline:string; approach:string;
  price_minor:number; delivery_days:number; status:string; created_at:string; relevant_evidence:unknown;
  market_profiles?:{display_name:string;skills:string[]}|null;
};
const db = () => {
  if (!supabase) throw new Error('Серверная база не настроена. Администратору нужно подключить Supabase.');
  return supabase;
};
const mapTask = (row:TaskRow, proposals:Proposal[]):MarketTask => ({
  id:row.id,title:row.title,vertical:row.vertical,category:row.category,company:row.company_name,
  description:row.description,outcome:row.outcome,
  criteria:Array.isArray(row.acceptance_criteria)?row.acceptance_criteria.filter((v):v is string=>typeof v==='string'):[],
  budget:Number(row.budget_minor)/100,days:row.target_days,skills:row.required_skills??[],
  status:row.status,proposals,createdAt:row.created_at,
});
export async function loadMarketplaceTasks(userId:string):Promise<MarketTask[]> {
  const client=db();
  const {data:taskRows,error:taskError}=await client.from('market_tasks').select('*').order('created_at',{ascending:false});
  if(taskError) throw taskError;
  const ids=(taskRows??[]).map(row=>row.id);
  if(!ids.length) return [];
  const {data:proposalRows,error:proposalError}=await client.from('market_proposals')
    .select('id,task_id,specialist_id,headline,approach,price_minor,delivery_days,status,created_at,relevant_evidence,market_profiles(display_name,skills)')
    .in('task_id',ids);
  if(proposalError) throw proposalError;
  const grouped=new Map<string,Proposal[]>();
  for(const p of (proposalRows??[]) as unknown as ProposalRow[]) {
    const profile=Array.isArray(p.market_profiles)?p.market_profiles[0]:p.market_profiles;
    const item:Proposal={id:p.id,specialist:profile?.display_name??'Специалист',headline:p.headline,pitch:p.approach,
      price:Number(p.price_minor)/100,days:p.delivery_days,skills:Array.isArray(p.relevant_evidence)?p.relevant_evidence.map((item)=>typeof item==='object'&&item!==null&&'skill' in item?String(item.skill):'').filter(Boolean):profile?.skills??[],score:0,createdAt:p.created_at};
    grouped.set(p.task_id,[...(grouped.get(p.task_id)??[]),item]);
  }
  return (taskRows as unknown as TaskRow[]).map(row=>mapTask(row,grouped.get(row.id)??[]));
}
export async function createMarketplaceTask(input:{
  userId:string;vertical:VerticalId;category:string;title:string;company:string;description:string;
  outcome:string;criteria:string[];budget:number;days:number;skills:string[];
}):Promise<string> {
  const client=db();
  const {data,error}=await client.from('market_tasks').insert({
    created_by:input.userId,vertical:input.vertical,category:input.category,title:input.title,
    company_name:input.company,description:input.description,outcome:input.outcome,
    acceptance_criteria:input.criteria,budget_minor:Math.round(input.budget*100),
    target_days:input.days,required_skills:input.skills,status:'open',
  }).select('id').single();
  if(error) throw error;
  return data.id as string;
}
export async function createMarketplaceProposal(input:{
  taskId:string;userId:string;headline:string;approach:string;price:number;days:number;skills:string[];
}):Promise<void> {
  const client=db();
  const {error}=await client.from('market_proposals').insert({
    task_id:input.taskId,specialist_id:input.userId,headline:input.headline,approach:input.approach,
    price_minor:Math.round(input.price*100),delivery_days:input.days,
    relevant_evidence:input.skills.map(skill=>({skill})),
  });
  if(error) throw error;
}
