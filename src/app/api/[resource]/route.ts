import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isResourceKey } from "@/lib/resources";

const schemas: Record<string, z.ZodObject<any>> = {
  prospects: z.object({name:z.string().trim().min(1).max(120),company:z.string().max(160).optional().nullable(),role:z.string().max(120).optional().nullable(),segment:z.string().min(1).max(120),channel:z.string().optional().nullable(),status:z.string().optional(),fit:z.string().max(4000).optional().nullable(),nextAction:z.string().max(1000).optional().nullable()}),
  interviews: z.object({customer:z.string().min(1).max(180),segment:z.string().min(1).max(120),problem:z.string().min(1).max(8000),last:z.string().optional().nullable(),frequency:z.string().optional(),impact:z.string().max(4000).optional().nullable(),workaround:z.string().max(4000).optional().nullable(),spend:z.string().max(1000).optional().nullable(),buyer:z.string().max(500).optional().nullable(),action:z.string().max(4000).optional().nullable(),unknowns:z.string().max(4000).optional().nullable(),confidence:z.string().optional(),quote:z.union([z.boolean(),z.string()]).optional(),incident:z.union([z.boolean(),z.string()]).optional(),buying:z.string().optional()}),
  hypotheses: z.object({problem:z.string().min(1).max(8000),segment:z.string().min(1),evidence:z.string().optional(),severity:z.string().optional(),frequency:z.string().optional(),access:z.string().optional(),spend:z.string().optional(),rationale:z.string().max(4000).optional().nullable(),status:z.string().optional()}),
  offers: z.object({customer:z.string().min(1).max(180),offer:z.string().min(1).max(4000),price:z.coerce.number().min(0).max(1e9).optional(),currency:z.string().optional(),status:z.string().optional(),cash:z.coerce.number().min(0).max(1e9).optional(),notes:z.string().max(4000).optional().nullable(),date:z.string().optional()}),
  experiments: z.object({title:z.string().min(1).max(250),date:z.string().optional(),status:z.string().optional(),time:z.coerce.number().min(0).max(10000).optional(),cost:z.coerce.number().min(0).max(1e9).optional(),result:z.string().max(8000).optional().nullable(),next:z.string().max(4000).optional().nullable()}),
  logEntries: z.object({date:z.string().optional(),type:z.string().optional(),title:z.string().min(1).max(250),notes:z.string().min(1).max(8000),next:z.string().max(4000).optional().nullable()})
};
const delegates: Record<string,string> = {prospects:"prospect",interviews:"interview",hypotheses:"hypothesis",offers:"offer",experiments:"experiment",logEntries:"founderLog"};
function normalize(resource:string, data:any) {
  const result={...data};
  for (const k of ["date","occurredAt","lastActivity"]) if (result[k] && typeof result[k]==="string") result[k]=new Date(result[k]);
  for (const k of ["quote","incident"]) if (k in result && typeof result[k]==="string") result[k]=result[k]==="Yes" || result[k]==="true";
  if (resource==="interviews" && result.quote===undefined) result.quote=false;
  if (resource==="interviews" && result.incident===undefined) result.incident=false;
  return result;
}
export async function GET(req: Request, {params}:{params:Promise<{resource:string}>}) {
  const session=await getServerSession(authOptions); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {resource}=await params; if(!isResourceKey(resource)||!delegates[resource]) return NextResponse.json({error:"Unknown resource"},{status:404});
  const url=new URL(req.url); const take=Math.min(Number(url.searchParams.get("take")||100),200);
  const delegate=(db as any)[delegates[resource]];
  const items=await delegate.findMany({where:{userId:session.user.id},orderBy:{createdAt:"desc"},take});
  return NextResponse.json({items});
}
export async function POST(req: Request, {params}:{params:Promise<{resource:string}>}) {
  const session=await getServerSession(authOptions); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {resource}=await params; if(!isResourceKey(resource)||!schemas[resource]) return NextResponse.json({error:"Unknown resource"},{status:404});
  let body; try{body=await req.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
  const parsed=schemas[resource].safeParse(body); if(!parsed.success) return NextResponse.json({error:"Please check the required fields and values.",details:parsed.error.flatten()},{status:400});
  const data=normalize(resource,parsed.data); delete data.id; delete data.userId; delete data.createdAt; delete data.updatedAt;
  const delegate=(db as any)[delegates[resource]]; const item=await delegate.create({data:{...data,userId:session.user.id}});
  return NextResponse.json({item},{status:201});
}
