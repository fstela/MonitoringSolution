import React, { useState } from "react";
import DateTimePicker from "react-datetime-picker";

const CreateSession: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  return (
    <div className="mt-10">
      <h1 className="font-bold text-lg mb-5">Create new session</h1>
      <div className="grid gird-cols-1 gap-3">
        <div className="form-control w-full">
          <label className="label">
            <span>Session title</span>
          </label>
          <input
            type="text"
            placeholder="eg. Math Exam"
            className="input input-bordered w-full max-w-md"
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span>Duration (in minutes)</span>
          </label>
          <input
            type="number"
            placeholder="30"
            className="input input-bordered w-full max-w-md"
          />
        </div>

        <div className="form-control w-full max-w-md">
          <label className="label">
            <span>Start time</span>
          </label>
          <DateTimePicker value={startDate} onChange={setStartDate} className="app-datapicker" disableClock={true}/>
        </div>
        <div className="form-control w-full max-w-md">
          <label className="label">
            <span>End time</span>
          </label>
          <DateTimePicker value={endDate} onChange={setEndDate} className="app-datapicker" disableClock={true}/>
        </div>
        <button className="btn btn-primary btn-active max-w-md mt-5">Create</button>
      </div>
    </div>
  );
};

export default CreateSession;
