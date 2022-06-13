import { AddParticipantRequest, SessionParticipant } from "@src/api/types";
import OptionsContext from "@src/pages/options/context";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { importCsvFile } from "@src/service/csv";

const SessionMonitoring: React.FC = () => {
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [blobFile, setBlobFile] = useState(new Blob());
  const context = useContext(OptionsContext);
  const inputFileRef = React.createRef<HTMLInputElement>();
  useEffect(() => {
    getParticipants();
  }, []);

  const getParticipants = () => {
    context.sessionService?.getParticipants().then((response) => {
      setParticipants(response.data);
    });
  };

  const setFile = (event: any) => {
    setBlobFile(event.target.files[0]);
  };

  const importFile = () => {
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
    if (blobFile.size > 0) {
      const fr = new FileReader();
      fr.readAsArrayBuffer(blobFile);
      fr.onload = () => {
        const emails = importCsvFile(fr.result)
          .filter((value: any) => {
            return "email" in value;
          })
          //@ts-ignore
          .map((data) => ({ email: data.email } as AddParticipantRequest));

        if (emails.length > 0) {
          addParticipants(emails);
        }

        setBlobFile(new Blob());
      };
    }
  };

  const addParticipants = (emails: AddParticipantRequest[]) => {
    context.sessionService?.addParticipants(emails).then(() => {
      toggleModal();
      toast.success("Imported with success");
      getParticipants();
    });
  };

  const toggleModal = () => setShowModal(!showModal);

  return (
    <div className="mt-10">
      <div className="grid grid-cols-12 mb-10">
        <h1 className="font-bold text-lg col-span-9">Session View</h1>
        <button
          className="btn btn-primary btn-md col-span-3"
          onClick={toggleModal}
        >
          Add participants
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Status</th>
              <th>Token</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr>
                <th>{participant.id}</th>
                <td>{participant.email}</td>
                <td>{participant.status}</td>
                <td>{participant.studentToken}</td>
                <td>
                  <button className="btn btn-error btn-sm">Delete</button>
                </td>
              </tr>
            ))}
            {participants.length === 0 && (
              <tr>
                <th>No participants found</th>
              </tr>
            )}
          </tbody>
        </table>

        <div className={`modal ${showModal && "modal-open"}`} id="my-modal-2">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add participants</h3>
            <p className="py-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima
              magni itaque sunt iusto tenetur in quae accusamus reiciendis
              minus? Fugit sed sapiente dolorum assumenda nesciunt quaerat
              explicabo dicta porro itaque.
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={setFile}
              ref={inputFileRef}
            />
            <div className="modal-action">
              <a href="#" className="btn btn-ghost" onClick={toggleModal}>
                Cancel
              </a>
              <button
                className="btn btn-primary"
                onClick={importFile}
                disabled={blobFile.size < 1}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionMonitoring;
