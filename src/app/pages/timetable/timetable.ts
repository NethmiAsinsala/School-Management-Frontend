import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolApiService } from '../../services/school-api.service';
interface Option { id:number; name:string; }
interface Lesson { id:number; classId:number; subjectId:number; subjectName:string; staffId:number; staffName:string; dayOfWeek:string; startTime:string; endTime:string; roomNumber?:string; }
@Component({selector:'app-timetable',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./timetable.html',styleUrl:'./timetable.css'})
export class Timetable implements OnInit {
  private loadVersion = 0;
  classes:Option[]=[];subjects:Option[]=[];staff:Option[]=[];lessons:Lesson[]=[];classId:number|undefined;loading=false;saving=false;error='';success='';showForm=false;editing:Lesson|null=null;
  form={subjectId:0,staffId:0,dayOfWeek:'MONDAY',startTime:'08:00',endTime:'09:00',roomNumber:''};
  readonly days=['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'];
  constructor(private api:SchoolApiService){} ngOnInit(){this.loadClasses();this.api.getPage<Option>('subjects',{page:0,size:200}).subscribe({next:x=>this.subjects=x.content,error:()=>this.error='Unable to load subjects.'});this.api.getPage<Option>('staff/filter',{page:0,size:200,category:'ACADEMIC',active:true}).subscribe({next:x=>this.staff=x.content,error:()=>this.error='Unable to load teachers.'});}
  private loadClasses(){this.api.get<unknown>('classes/active').subscribe({next:raw=>{const items=this.classItems(raw);if(items.length){this.setClasses(items);return;}this.loadClassPage();},error:()=>this.loadClassPage()});}
  private loadClassPage(){this.api.getPage<Option>('classes',{page:0,size:200}).subscribe({next:p=>this.setClasses(p.content||[]),error:()=>this.error='Unable to load classes.'});}
  private classItems(raw:unknown):Option[]{if(Array.isArray(raw))return raw as Option[];const page=raw as {content?:Option[]};return Array.isArray(page?.content)?page.content:[];}
  private setClasses(items:Option[]){this.classes=items;if(items.length){this.classId=items[0].id;this.load();}else this.error='No active classes are available. Create a class first.';}
  load(){const version=++this.loadVersion;if(!this.classId){this.lessons=[];return;}this.loading=true;this.error='';this.api.get<Lesson[]>(`timetable/class/${this.classId}`).subscribe({next:x=>{if(version!==this.loadVersion)return;this.lessons=x.sort((a,b)=>a.dayOfWeek.localeCompare(b.dayOfWeek)||a.startTime.localeCompare(b.startTime));this.loading=false;},error:e=>{if(version!==this.loadVersion)return;this.error=e?.error?.message||'Unable to load timetable.';this.loading=false;}});}
  openCreate(){this.editing=null;this.form={subjectId:0,staffId:0,dayOfWeek:'MONDAY',startTime:'08:00',endTime:'09:00',roomNumber:''};this.showForm=true;}
  openEdit(x:Lesson){this.editing=x;this.form={subjectId:x.subjectId,staffId:x.staffId,dayOfWeek:x.dayOfWeek,startTime:x.startTime,endTime:x.endTime,roomNumber:x.roomNumber||''};this.showForm=true;}
  save(){if(!this.classId||!this.form.subjectId||!this.form.staffId||this.saving)return;this.saving=true;this.error='';const body={classId:this.classId,...this.form,roomNumber:this.form.roomNumber||undefined};const req=this.editing?this.api.put<Lesson>(`timetable/${this.editing.id}`,body):this.api.post<Lesson>('timetable',body);req.subscribe({next:()=>{this.saving=false;this.showForm=false;this.success=this.editing?'Lesson updated.':'Lesson added.';this.load();},error:e=>{this.saving=false;this.error=e?.error?.message||'Could not save lesson.';}});}
  remove(x:Lesson){if(!confirm(`Delete ${x.subjectName} on ${x.dayOfWeek}?`))return;this.api.delete(`timetable/${x.id}`).subscribe({next:()=>{this.success='Lesson deleted.';this.load();},error:e=>this.error=e?.error?.message||'Could not delete lesson.'});}
}
