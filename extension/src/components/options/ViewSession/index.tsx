import { AddParticipantRequest, SessionParticipant } from "@src/api/types";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { importCsvFile } from "@src/service/csv";
import { createClient } from "@src/api/ApiService";
import SessionService from "@src/api/SessionService";
import { useNavigate } from "react-router-dom";

const SessionMonitoring: React.FC = () => {
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [blobFile, setBlobFile] = useState(new Blob());
  const inputFileRef = React.createRef<HTMLInputElement>();
  const [service, setService] = useState<SessionService | undefined>(undefined);
  const [showAllowedWebsiteModal, setShowAllowedWebsiteModal] =
    useState<boolean>(false);
  const navigate = useNavigate();
  useEffect(() => {
    chrome.storage.local.get(["token"], (items) => {

      if (items.token) {
        const client = createClient(items.token);
        const service = new SessionService(client);
        setService(service);
        getParticipants(service);
      } else {
        toast.error(
          "Invalid login token, please close the browser and try again",
          {
            duration: 30000,
          }
        );
      }
    });
  }, []);

  const getParticipants = (service: SessionService) => {
    service.getParticipants().then((response) => {
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
        console.log(emails);
        console.log("=====");
        if (emails.length > 0) {
          for (let i = 0; i < 0; i++) {
            console.log(emails[i]);
          }
        }
        console.log("=====");
        if (emails.length > 0) {
          addParticipants(emails);
        }

        setBlobFile(new Blob());
      };
    }
  };

  const addParticipants = (emails: AddParticipantRequest[]) => {
    if (!service) {
      toast.error(
        "Invalid login token, please close the browser and try again",
        {
          duration: 30000,
        }
      );
      return;
    }
    service.addParticipants(emails).then(() => {
      toggleModal();
      toast.success("Imported with success");
      getParticipants(service);
    });
  };

  const toggleModal = () => setShowModal(!showModal);
  const toggleAllowedWebsites = () =>
    setShowAllowedWebsiteModal(!showAllowedWebsiteModal);
  const deleteParticipant = (id: number) => {
    if (service) {
      service.deleteParticipant(id).then(() => {
        toast.success("Participant deleted");
        getParticipants(service);
      });
    }
  };

  return (
    <div className="mt-10">
      <div className="grid grid-cols-12 mb-10 gap-2">
        <h1 className="font-bold text-lg col-span-6">Session View</h1>
        <button
          className="btn btn-primary btn-md col-span-2"
          onClick={() => navigate("/monitoring")}
        >
          Monitoring
        </button>
        <button
          className="btn btn-primary btn-md col-span-2"
          onClick={toggleModal}
        >
          Add participants
        </button>

        <button
          className="btn btn-primary btn-md col-span-2"
          onClick={toggleAllowedWebsites}
        >
          Websites
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
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => deleteParticipant(participant.id)}
                  >
                    Delete
                  </button>
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
        {service && (
          <WebsitesModal
            service={service}
            isHidden={!showAllowedWebsiteModal}
            cancel={() => setShowAllowedWebsiteModal(false)}
          />
        )}
      </div>
    </div>
  );
};

const WebsitesModal: React.FC<{
  isHidden: boolean;
  cancel: () => void;
  service: SessionService;
}> = ({ isHidden, cancel, service }) => {
  const [data, setData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    service.getSessionInfo().then((data) => {
      setData(data.data.allowedUrls ?? []);
      setIsLoading(false);
    });
  }, [isHidden]);

  const addWebsite = () => {
    if (ref.current) {
      const value = ref.current.value;
      if (value) {
        const values = [...data, value];
        setData(values);
        ref.current.value = "";
      }
    }
  };

  const submit = () => {
    if (data) {
      service
        .updateAllowedWebsited(data)
        .then(() => {
          toast.success("Websites list updated");
          cancel();
        })
        .catch(() => {
          toast.error("Failed to update the websites list");
        });
    }
  };

  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={`modal ${!isHidden && "modal-open"}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Allowed websites</h3>
        <p className="py-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima magni
          itaque sunt iusto tenetur in quae accusamus reiciendis minus? Fugit
          sed sapiente dolorum assumenda nesciunt quaerat explicabo dicta porro
          itaque.
        </p>
        {isLoading && <p>Loading data</p>}
        {!isLoading && (
          <>
            <div className="grid grid-cols-6 gap-2 w-full mb-10 ">
              <input
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full col-span-5"
                ref={ref}
              />
              <button
                className="btn btn-primary col-span-1"
                onClick={addWebsite}
              >
                Add
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Website</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((website, index) => (
                    <tr key={index}>
                      <th>{website}</th>
                      <td>
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() =>
                            setData(data.filter((_, i) => i !== index))
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="modal-action">
          <a href="#" className="btn btn-ghost" onClick={cancel}>
            Cancel
          </a>
          <button className="btn btn-primary" onClick={submit} disabled={false}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionMonitoring;
