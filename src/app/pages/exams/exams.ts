import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolApiService } from '../../services/school-api.service';
interface Opt { id:number; name:string; }
interface Exam { id:number; name:string; className?:string; subjectName?:string; examDate:string; type:string; maxMarks:number; passMarks:number; active:boolean; academicYearId:number; academicTermId:number; classId:number; subjectId:number; description?:string; }
@Component({selector:'app-exams',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./exams.html',styleUrl:'./exams.css'})
export class Exams implements OnInit {
  private loadVersion=0;
  exams:Exam[]=[]; classes:Opt[]=[]; subjects:Opt[]=[]; years:Opt[]=[]; terms:Opt[]=[]; page=0; total=0; loading=false; saving=false; error=''; show=false; editing:Exam|null=null;
  form:any={name:'',academicYearId:0,academicTermId:0,classId:0,subjectId:0,type:'TERM_TEST',examDate:'',maxMarks:100,passMarks:40,passPercentage:40,description:''};
  constructor(private readonly api:SchoolApiService,private readonly cdr:ChangeDetectorRef){}
  ngOnInit(){this.api.getPage<Opt>('classes',{page:0,size:200}).subscribe({next:x=>this.classes=x.content});this.api.getPage<Opt>('subjects',{page:0,size:200}).subscribe({next:x=>this.subjects=x.content});this.api.getPage<Opt>('academic-years',{page:0,size:200}).subscribe({next:x=>this.years=x.content});this.api.getPage<Opt>('academic-terms',{page:0,size:200}).subscribe({next:x=>this.terms=x.content});this.load();}
  load(){const version=++this.loadVersion;this.loading=true;this.error='';this.api.getPage<Exam>('exams/filter',{page:this.page,size:20}).subscribe({next:x=>{if(version!==this.loadVersion)return;this.exams=x.content;this.total=x.totalElements;this.loading=false;this.cdr.detectChanges();},error:e=>{if(version!==this.loadVersion)return;this.error=e?.error?.message||'Unable to load exams.';this.loading=false;this.cdr.detectChanges();}});}
  open(x?:Exam){this.editing=x||null;this.form=x?{...x,passPercentage:Math.round((x.passMarks/x.maxMarks)*100)}:{name:'',academicYearId:0,academicTermId:0,classId:0,subjectId:0,type:'TERM_TEST',examDate:'',maxMarks:100,passMarks:40,passPercentage:40,description:''};this.show=true;setTimeout(()=>document.getElementById('exam-editor')?.scrollIntoView({behavior:'smooth',block:'start'}));}
  closeEditor(){this.show=false;this.editing=null;this.error='';}
  save(){if(this.saving)return;this.saving=true;const payload={...this.form,passMarks:Number(this.form.maxMarks)*Number(this.form.passPercentage)/100};delete payload.passPercentage;const request=this.editing?this.api.patch(`exams/${this.editing.id}`,payload):this.api.post('exams',payload);request.subscribe({next:()=>{this.saving=false;this.closeEditor();this.load();this.cdr.detectChanges();},error:e=>{this.saving=false;this.error=e?.error?.message||'Could not save exam.';this.cdr.detectChanges();}});}
  toggle(x:Exam){const request=x.active?this.api.delete(`exams/${x.id}`):this.api.post(`exams/${x.id}/activate`);request.subscribe({next:()=>this.load(),error:e=>{this.error=e?.error?.message||'Could not update exam.';this.cdr.detectChanges();}});}
  passPercentage(exam:Exam):number{return exam.maxMarks ? Math.round((exam.passMarks/exam.maxMarks)*100) : 0;}
}
