import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/dashboard.css";

function ClassDetails(){
  const { id }=useParams(); const navigate=useNavigate();
  const [data,setData]=useState(null),[teachers,setTeachers]=useState([]),[subjects,setSubjects]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const load=async()=>{try{setLoading(true);setError("");const [detail,teacherList,subjectList]=await Promise.all([api.get(`/classes/${id}`),api.get("/teachers"),api.get("/subjects")]);setData(detail.data);setTeachers(teacherList.data);setSubjects(subjectList.data)}catch(e){setError(e.response?.data?.message||"Unable to load this class.")}finally{setLoading(false)}};
  useEffect(()=>{load()},[id]);
  const saveTeachers=async e=>{try{await api.put(`/classes/${id}/teachers`,{teacher_ids:Array.from(e.target.elements.teacher_ids.selectedOptions).map(o=>Number(o.value))});await load()}catch(e){setError(e.response?.data?.message||"Unable to update teachers.")}};
  const saveSubjects=async e=>{try{await api.put(`/classes/${id}/subjects`,{subject_ids:Array.from(e.target.elements.subject_ids.selectedOptions).map(o=>Number(o.value))});await load()}catch(e){setError(e.response?.data?.message||"Unable to update subjects.")}};
  if(loading)return <div className="dashboard-page"><div className="empty-state">Loading class space...</div></div>;
  if(error&&!data)return <div className="dashboard-page"><div className="error-message">{error}</div><button onClick={()=>navigate(-1)}>← Back</button></div>;
  const teacherIds=new Set((data?.teachers||[]).map(t=>t.id)),subjectIds=new Set((data?.subjects||[]).map(s=>s.id));
  return <div className="dashboard-page class-space">
    <button type="button" className="secondary-button" onClick={()=>navigate(-1)}>← Back to Classes</button>
    <div className="welcome-hero class-space-hero"><span className="eyebrow light">VLE CLASS SPACE</span><h1>{data.name}</h1><p>{data.description||"This is your connected learning space."}</p><div className="welcome-actions"><span>{data.code}</span><span>{data.academic_year||"Academic year not set"}</span></div></div>
    {error&&<div className="error-message">{error}</div>}
    <div className="dashboard-home-stats"><div className="home-stat blue"><span>👨‍🎓</span><strong>{data.students.length}</strong><small>Students</small></div><div className="home-stat green"><span>👨‍🏫</span><strong>{data.teachers.length}</strong><small>Teachers</small></div><div className="home-stat orange"><span>📚</span><strong>{data.subjects.length}</strong><small>Subjects</small></div><div className="home-stat purple"><span>🎓</span><strong>Active</strong><small>Learning space</small></div></div>
    <div className="class-space-grid">
      <section className="dashboard-card"><div className="card-heading"><div><h2>Students</h2><p>Learners currently enrolled in this class.</p></div></div>{data.students.length?<div className="class-member-list">{data.students.map(s=><div className="class-member" key={s.id}><span className="member-avatar student-avatar">{s.full_name?.[0]}</span><div><strong>{s.full_name}</strong><small>{s.student_id} · {s.email}</small></div></div>)}</div>:<div className="empty-state">No students assigned yet.</div>}</section>
      <section className="dashboard-card"><div className="card-heading"><div><h2>Teachers</h2><p>Teachers responsible for this class.</p></div></div>{data.teachers.length?<div className="class-member-list">{data.teachers.map(t=><div className="class-member" key={t.id}><span className="member-avatar">{t.full_name?.[0]}</span><div><strong>{t.full_name}</strong><small>{t.subject||"Teacher"} · {t.email}</small></div></div>)}</div>:<div className="empty-state">No teachers assigned yet.</div>}
        <form onSubmit={e=>{e.preventDefault();saveTeachers(e)}} className="assignment-form"><label>Manage teachers<select name="teacher_ids" multiple defaultValue={teachers.filter(t=>teacherIds.has(t.id)).map(t=>String(t.id))}>{teachers.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}</select></label><button>Save Teachers</button></form>
      </section>
      <section className="dashboard-card class-space-wide"><div className="card-heading"><div><h2>Subjects</h2><p>Subjects offered inside this class.</p></div></div><div className="subject-chip-grid">{data.subjects.map(s=><span className="subject-chip" key={s.id}><b>{s.code}</b>{s.name}</span>)}{!data.subjects.length&&<div className="empty-state">No subjects assigned yet.</div>}</div><form onSubmit={e=>{e.preventDefault();saveSubjects(e)}} className="assignment-form"><label>Manage subjects<select name="subject_ids" multiple defaultValue={subjects.filter(s=>subjectIds.has(s.id)).map(s=>String(s.id))}>{subjects.map(s=><option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></label><button>Save Subjects</button></form></section>
    </div>
  </div>
}
export default ClassDetails;
