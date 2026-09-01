import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import SkillRequestForm from "../components/SkillRequestForm";
import RequestToast from "../components/requestSkill/RequestToast";

export default function RequestSkillPage() {

  const { user } = useAuth();
  const [, navigate] = useLocation();
  const profile = {
    fullName:user?.fullName,
    profilePicture:user?.profilePicture,
    department:user?.department,
    role:user?.role,
  };


  const [toast,setToast] = useState(null);


  const showToast = (message,type="success")=>{
    setToast({message,type});

    setTimeout(()=>{
      setToast(null);
    },3500);
  };


  return (
    <DashboardLayout profile={profile}>

      <div className="min-h-screen bg-[#faf8ff] px-8 py-8">

        <h1 className="text-3xl font-bold text-[#002045]">
          Request a Skill
        </h1>


        <SkillRequestForm
          showToast={showToast}
          onCancel={() => {
            navigate("/skill-exchange");
            setTimeout(() => {
              window.scrollTo(0, 0);
            }, 0);
          }}
        />

      </div>


      {toast && (
        <RequestToast
          message={toast.message}
          type={toast.type}
        />
      )}

    </DashboardLayout>
  );
}