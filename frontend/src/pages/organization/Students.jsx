import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/dashboard.css";

const emptyForm={full_name:"",email:"",phone:"",gender:"",date_of_birth:"",class_id:"",password:""};

function Students(){
  const [students,setStudents]=useState([]),[classes,setClasses]=useState([]),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[form,setForm]=useState(emptyForm);
  const loadData=async()=>{try{setLoading(true);setError("");const [studentsResponse,classesResponse]=await Promise.all([api.get("/students"),api.get("/classes")]);setStudents(studentsResponse.data);setClasses(classesResponse.data)}catch(e){setError(e.response?.data?.message||"Unable to load students and classes.")}finally{setLoading(false)}};
  useEffect(()=>{loadData()},[]);
  const handleChange=e=>setForm(c=>({...c,[e.target.name]:e.target.value}));
  const handleSubmit=async e=>{e.preventDefault();try{setSaving(true);setError("");await api.post("/students",form);setForm(emptyForm);await loadData()}catch(err){setError(err.response?.data?.message||"Unable to add student.")}finally{setSaving(false)}};
  const handleDelete=async id=>{if(!window.confirm("Delete this student?"))return;try{setError("");await api.delete(`/students/${id}`);setStudents(c=>c.filter(s=>s.id!==id))}catch(e){setError(e.response?.data?.message||"Unable to delete student.")}};
  const classNameFor=s=>s.class_name||classes.find(c=>Number(c.id)===Number(s.class_id))?.name||"Class not assigned";
  return <div className="dashboard-page people-page">
    <div className="page-header"><div><span className="eyebrow">LEARNER DIRECTORY</span><h1>Student Management</h1><p>Build your VLE by placing every learner in a real class.</p></div><div className="stat-card student-stat"><strong>{students.length}</strong><span>Registered Students</span></div></div>
    {error&&<div className="error-message">{error}</div>}
    <section className="dashboard-card people-form-card student-form-card"><div className="card-heading"><div><h2>Add a Student</h2><p>The class is connected directly to the VLE.</p></div><span className="section-accent green">Learners</span></div>
      <form onSubmit={handleSubmit} className="class-form-grid">
        <label>Full name<input name="full_name" placeholder="e.g. Kofi Mensah" value={form.full_name} onChange={handleChange} required/></label>
        <label>Email address<input name="email" type="email" placeholder="student@example.com" value={form.email} onChange={handleChange} required/></label>
        <label>Phone<input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange}/></label>
        <label>Gender<select name="gender" value={form.gender} onChange={handleChange}><option value="">Select gender</option><option>Male</option><option>Female</option></select></label>
        <label>Date of birth<input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange}/></label>
        <label>Class<select name="class_id" value={form.class_id} onChange={handleChange} required><option value="">Select a class</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select></label>
        <label>Temporary password<input name="password" type="password" placeholder="Create temporary password" value={form.password} onChange={handleChange} required/></label>
        <div className="form-action"><button type="submit" disabled={saving||!classes.length}>{saving?"Creating...":!classes.length?"Create a class first":"+ Add Student"}</button></div>
      </form>
    </section>
    <section className="dashboard-card"><div className="card-heading"><div><h2>Student Directory</h2><p>Registered learners and their connected classes.</p></div></div>{loading?<div className="empty-state">Loading student directory...</div>:students.length===0?<div className="empty-state"><strong>No students yet</strong><span>Add your first learner above.</span></div>:<div className="people-grid">{students.map(s=><article className="person-card student-card" key={s.id}><div className="person-avatar student-avatar">{s.full_name?.charAt(0)?.toUpperCase()}</div><div className="person-info"><span className="person-id">{s.student_id}</span><h3>{s.full_name}</h3><p>{classNameFor(s)}</p><small>{s.email}</small>{s.phone&&<small>{s.phone}</small>}</div><button className="person-delete" type="button" onClick={()=>handleDelete(s.id)}>Remove</button></article>)}</div>}</section>
  </div>
}
export default Students;
