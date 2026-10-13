import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { isResourceKey } from "@/lib/resources";
const delegates: Record<string,string> = {prospects:"prospect",interviews:"interview",hypotheses:"hypothesis",offers:"offer",experiments:"experiment",logEntries:"founderLog"};
export async function DELETE(_req:Request,{params}:{params:Promise<{resource:string;id:string}>}){
 const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {resource,id}=await params;if(!isResourceKey(resource)||!delegates[resource])return NextResponse.json({error:"Unknown resource"},{status:404});
 const delegate=(db as any)[delegates[resource]];const found=await delegate.findFirst({where:{id,userId:session.user.id}});if(!found)return NextResponse.json({error:"Record not found"},{status:404});
 await delegate.delete({where:{id}});return NextResponse.json({ok:true});
}

const editable:Record<string,string[]>={
 prospects:["name","company","role","segment","channel","status","fit","nextAction","lastActivity"],
 interviews:["customer","segment","problem","last","frequency","impact","workaround","spend","buyer","action","unknowns","confidence","quote","incident","buying","occurredAt"],
 hypotheses:["problem","segment","evidence","severity","frequency","access","spend","rationale","status"],
 offers:["customer","offer","price","currency","status","cash","notes","date"],
 experiments:["title","date","status","time","cost","result","next"],
 logEntries:["date","type","title","notes","next"]
};
export async function PATCH(req:Request,{params}:{params:Promise<{resource:string;id:string}>}){
 const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {resource,id}=await params;if(!isResourceKey(resource)||!delegates[resource]||!editable[resource])return NextResponse.json({error:"Unknown resource"},{status:404});
 let body:any;try{body=await req.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
 const data:any={};for(const key of editable[resource])if(Object.prototype.hasOwnProperty.call(body,key))data[key]=body[key];
 if(!Object.keys(data).length)return NextResponse.json({error:"No editable fields supplied"},{status:400});
 for(const key of ["date","occurredAt","lastActivity"])if(data[key]&&typeof data[key]==="string")data[key]=new Date(data[key]);
 for(const key of ["price","cash","time","cost"])if(data[key]!==undefined){data[key]=Number(data[key]);if(!Number.isFinite(data[key])||data[key]<0)return NextResponse.json({error:`Invalid ${key}`},{status:400})}
 for(const key of ["quote","incident"])if(data[key]!==undefined&&typeof data[key]==="string")data[key]=data[key]==="Yes"||data[key]==="true";
 const delegate=(db as any)[delegates[resource]];const found=await delegate.findFirst({where:{id,userId:session.user.id}});if(!found)return NextResponse.json({error:"Record not found"},{status:404});
 const item=await delegate.update({where:{id},data});return NextResponse.json({item});
}
