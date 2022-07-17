import React, { useState } from "react";
import DateTimePicker from "react-datetime-picker";
import Joi from "joi";
import { getUnixTime } from "date-fns";
import SessionService from "@src/api/SessionService";
import { createClient } from "@src/api/ApiService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { subMinutes} from "date-fns"

const CreateSessionSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  duration: Joi.number().integer().min(5).max(200).required(),
  startDate: Joi.date().greater(subMinutes(new Date(), 1)).required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
});

const CreateSession: React.FC = () => {
  // we don't need to be authenticated
  const service = new SessionService(createClient(""));

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<undefined | string>(
    undefined
  );
  const [inProgress, setInProgress] = useState(false);
  const [sessionToken, setSessionToken] = useState<undefined | string>(
    undefined
  );

  const createSession = () => {
    setInProgress(true);
    setErrorMessage(undefined);
    const validationResult = CreateSessionSchema.validate({
      duration,
      title,
      endDate,
      startDate,
    });
    if (validationResult.error) {
      setErrorMessage(validationResult.error.message);
      setInProgress(false);
      return;
    }

    service
      .createSession({
        duration,
        title,
        endTime: getUnixTime(endDate),
        startTime: getUnixTime(startDate),
      })
      .then(
        (response) => {
          setSessionToken(response.data.jwt);
        },
        (err) => {
          console.log(err);
          setErrorMessage("Error from server");
          setInProgress(false);
        }
      )
      .catch((err) => {
        console.log(err);
        setErrorMessage("Error from server");
        setInProgress(false);
      });
  };

  return (
    <div className="mt-10">
      {sessionToken && <SuccessMessage token={sessionToken} />}
      {!sessionToken && (
        <>
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
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) => setDuration(Number.parseInt(e.target.value))}
              />
            </div>

            <div className="form-control w-full max-w-md">
              <label className="label">
                <span>Start time</span>
              </label>
              <DateTimePicker
                value={startDate}
                onChange={setStartDate}
                className="app-datapicker"
                disableClock={true}
              />
            </div>
            <div className="form-control w-full max-w-md">
              <label className="label">
                <span>End time</span>
              </label>
              <DateTimePicker
                value={endDate}
                onChange={setEndDate}
                className="app-datapicker"
                disableClock={true}
              />
            </div>
            <button
              className={`btn btn-primary btn-active max-w-md mt-5 ${
                inProgress && "loading"
              }`}
              onClick={createSession}
              disabled={inProgress}
            >
              Create
            </button>
            {errorMessage && (
              <p className="text-red-500">Error: {errorMessage}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const SuccessMessage: React.FC<{ token: string }> = ({ token }) => {
  const copyTokenToClipboard = () => {
    navigator.clipboard.writeText(token);
    toast.success("Token copied to clipboard");
  };


  const navigate = useNavigate();
  const navigateToSessionPage = () => {
    chrome.storage.local.set({ token }).then(() => {
      navigate("/view");
    })
  };

  return (
    <div>
      <h1 className="font-bold text-lg mb-3">Session created with success!</h1>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Illo, quasi
        facere? Labore quaerat beatae ut vero, accusantium ullam aspernatur odio
        cum officiis inventore error ad architecto iure, aliquam veniam
        voluptates!
      </p>
      <div className="form-control mt-5 w-full">
        <div className="input-group w-full">
          <input
            type="text"
            value={token}
            disabled={true}
            className="input input-bordered max-w-lg w-full"
          />
          <button className="btn btn-active" onClick={copyTokenToClipboard}>
            Copy!
          </button>
        </div>
      </div>
      <button
        className="btn btn-active btn-primary mt-5"
        onClick={navigateToSessionPage}
      >
        Access session page
      </button>
    </div>
  );
};

export default CreateSession;
