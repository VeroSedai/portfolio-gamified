import { useAtom, useAtomValue } from "jotai";
import { isWorkExperienceModalVisibleAtom, workExperienceDataAtom } from "../stores";

export default function WorkExperienceModal() {
  const [isVisible, setIsVisible] = useAtom(isWorkExperienceModalVisibleAtom);
  const workData = useAtomValue(workExperienceDataAtom);

  if (!isVisible) return null;

  return (
    <div className="modal">
      <div className="modal-content work-experience-modal">
        <div className="modal-header">
          <h1>CAREER_LOG</h1>
          <button className="close-btn" onClick={() => setIsVisible(false)}>X</button>
        </div>

        <div className="timeline-container">
          {workData.map((job, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h2 className="role-title">{job.roleData.title}</h2>
                <div className="company-info">
                  <span className="company-name">{job.roleData.company.name}</span>
                  <span className="dates">
                    [{job.roleData.company.startDate} - {job.roleData.company.endDate}]
                  </span>
                </div>
                <p className="job-desc">{job.roleData.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}