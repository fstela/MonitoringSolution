import { Chart as ChartJS, registerables } from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(...registerables);
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import moment from "moment";
import colorLib from "@kurkle/color";
import { createClient } from "@src/api/ApiService";
import SessionService from "@src/api/SessionService";
import toast from "react-hot-toast";
import { SessionParticipantMonitoring } from "@src/api/types";

export function transparentize(value: string, opacity: number) {
  var alpha = opacity === undefined ? 0.5 : 1 - opacity;
  return colorLib(value).alpha(alpha).rgbString();
}

export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

const MonitoringDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [data, setData] = useState<SessionParticipantMonitoring[]>([]);
  const { id } = useParams();
  if (!id) {
    throw Error("Invalid id");
  }

  useEffect(() => {
    let timer = undefined as any;
    chrome.storage.local.get(["token"], (items) => {
      if (items.token) {
        const client = createClient(items.token);
        const service = new SessionService(client);
        loadData(service);
        timer = setInterval(() => loadData(service), 5000);
      } else {
        toast.error(
          "Invalid login token, please close the browser and try again",
          {
            duration: 30000,
          }
        );
      }
    });
    return () => {
      timer && clearInterval(timer);
    };
  }, []);

  const loadData = (service: SessionService) => {
    service.getParticipantMonitoringData(id).then((response) => {
      setData(response.data);
    });
  };

  const getData = () => {
    let chartData = {
      labels: data.map((d) => moment.unix(d.date).format("LTS")),
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
      datasets: [
        {
          label: "Audio Flags",
          data: data.map((d) => d.a),
          borderColor: "blue",
          backgroundColor: transparentize(CHART_COLORS.blue, 0.5),
        },
        {
          label: "Video Flags",
          data: data.map((d) => d.v),
          borderColor: "orange",
          backgroundColor: transparentize(CHART_COLORS.orange, 0.5),
        },
        {
          label: "Keys Flags",
          data: data.map((d) => d.k),
          borderColor: "green",
          backgroundColor: transparentize(CHART_COLORS.green, 0.5),
        },
        {
          label: "Browser Flags",
          data: data.map((d) => d.b),
          borderColor: "purple",
          backgroundColor: transparentize(CHART_COLORS.purple, 0.5),
        },
      ],
    };

    return chartData;
  };
  return (
    <>
      <div className="mt-10">
        <div className="grid grid-cols-12 mb-10 gap-2">
          <h1 className="font-bold text-lg col-span-9">
            Participant Monitoring
          </h1>
          <button
            className="btn btn-primary btn-md col-span-3"
            onClick={() => navigate("/monitoring")}
          >
            Session Monitoring
          </button>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Audio Flags</div>
                  <div className="stat-value">
                    {data.reduce((p, c) => p + c.a, 0)}
                  </div>
                  <div className="stat-desc">lorem ipsum dolor etec</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Total Video Flags</div>
                  <div className="stat-value">
                    {data.reduce((p, c) => p + c.v, 0)}
                  </div>
                  <div className="stat-desc">lorem ipsum dolor etec</div>
                </div>
              </div>
              <div className="stats shadow mt-4">
                <div className="stat">
                  <div className="stat-title">Total Keys Flags</div>
                  <div className="stat-value">
                    {data.reduce((p, c) => p + c.k, 0)}
                  </div>
                  <div className="stat-desc">lorem ipsum dolor etec</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Total Browser Flags</div>
                  <div className="stat-value">
                    {data.reduce((p, c) => p + c.b, 0)}
                  </div>
                  <div className="stat-desc">lorem ipsum dolor etec</div>
                </div>
              </div>
              <div className="stats shadow mt-4">
                <div className="stat">
                  <div className="stat-title">Total Flags</div>
                  <div className="stat-value">
                    {data.reduce((p, c) => p + c.a + c.v + c.k + c.b, 0)}
                  </div>
                  <div className="stat-desc">lorem ipsum dolor etec</div>
                </div>
              </div>
              <div className="mt-4">
                <Bar data={getData()} />
              </div>
            </div>
          </div>
          <div>
            <div className="tabs tabs-boxed">
              <a
                className={`tab ${activeTab === 1 && "tab-active"}`}
                onClick={() => setActiveTab(1)}
              >
                Recordings
              </a>
              <a
                className={`tab ${activeTab === 2 && "tab-active"}`}
                onClick={() => setActiveTab(2)}
              >
                Keys
              </a>
              <a
                className={`tab ${activeTab === 3 && "tab-active"}`}
                onClick={() => setActiveTab(3)}
              >
                Browser
              </a>
            </div>
            <div>
              {activeTab === 1 && <Recordings data={data} />}
              {activeTab === 2 && <Keys data={data} />}
              {activeTab === 3 && <Browser data={data} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Recordings: React.FC<{ data: SessionParticipantMonitoring[] }> = ({
  data,
}) => {
  const [src, setSrc] = useState<{ url: string; title: string } | undefined>(
    undefined
  );
  return (
    <>
      <div className="mt-5 overflow-y-scroll h-screen">
        {data.map((data, index) => (
          <div
            className="indicator w-full mt-3 "
            onClick={() => {
              setSrc({
                url: `http://localhost:9060/monitoring/${data.url}`,
                title: ` Frame ${index} - ${
                  data.url.split("/")[1] ?? ""
                } (${moment.unix(data.date).format("LTS")})`,
              });
            }}
          >
            {(data.a >= 1 || data.v >= 1) && (
              <span className="indicator-item indicator-start badge badge-secondary ml-10">
                {data.a ? "Audio" : "Video"}
              </span>
            )}
            <div className="card w-full bg-base-100 hover:bg-base-300 shadow-sm cursor-pointer  ">
              <div className="card-body p-5">
                <p>{`(${moment.unix(data.date).format("LTS")})`}</p>
                <p>
                  Frame {index} - {data.url.split("/")[1] ?? ""}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {src && (
        <ViewVideoModal
          src={src.url}
          title={src.title}
          cancel={() => setSrc(undefined)}
        />
      )}
    </>
  );
};

const Keys: React.FC<{ data: SessionParticipantMonitoring[] }> = ({ data }) => {
  return (
    <div className="mt-5 overflow-y-scroll h-screen">
      {data.map((data) => (
        <div className="indicator w-full mt-3 ">
          {data.k >= 1 && (
            <span className="indicator-item indicator-start badge badge-secondary ml-3"></span>
          )}
          <div className="card w-full bg-base-100 hover:bg-base-300 shadow-sm ">
            <div className="card-body p-5">
              <p>{`(${moment.unix(data.date).format("LTS")})`}</p>
              {data.loggedKeys.length > 0 && (
                <kbd className="kbd kbd-sm">{data.loggedKeys.join(",")}</kbd>
              )}
              {data.loggedKeys.length == 0 && <p>no data</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Browser: React.FC<{ data: SessionParticipantMonitoring[] }> = ({
  data,
}) => {
  return (
    <div className="mt-5 overflow-y-scroll h-screen">
      {data.map((data) => (
        <div className="indicator w-full mt-3 ">
          {data.b >= 1 && (
            <span className="indicator-item indicator-start badge badge-secondary ml-3"></span>
          )}
          <div className="card w-full bg-base-100 hover:bg-base-300 shadow-sm ">
            <div className="card-body p-5">
              <p>{`(${moment.unix(data.date).format("LTS")})`}</p>
              {data.browserData.length == 0 && <p>no data</p>}
              {data.browserData.map((t) => {
                return (
                  <textarea rows={3} className="mb-2 px-2" disabled>
                    {t
                      .split("#")
                      .map((d) => d.replace("_", " - "))
                      .join(" , ")}
                  </textarea>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ViewVideoModal: React.FC<{
  title: string;
  src: string;
  cancel: () => void;
}> = ({ title, cancel, src }) => {
  return (
    <div className={`modal modal-open`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">View frame</h3>
        <p>{title}</p>
        <video controls src={src} autoPlay className="w-full py-3" />

        <div className="modal-action">
          <a href={src} target="_blank" className="btn btn-ghost">
            Download
          </a>
          <a href="#" className="btn btn-ghost" onClick={cancel}>
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDetail;
