import { Chart as ChartJS, registerables } from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(...registerables);
import { useNavigate, useParams } from "react-router-dom";
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import moment from "moment";
import colorLib from "@kurkle/color";
import { createClient } from "@src/api/ApiService";
import SessionService from "@src/api/SessionService";
import toast from "react-hot-toast";

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
    service.getParticipantMonitoringData(id).then(response => {
      const labels = [] as string[];
      const a = [] as number[];
      const v = [] as number[];
      const k = [] as number[];
      const b = [] as number[];
      response.data.recordings.forEach(r => {
        labels.push(moment(r.date).format("LTS"))
        a.push(r.a)
      })
    })
  };

  const getData = (labels: string[], a: number[], v: number[], k: number[], b: number[]) => {
    let chartData = {
      labels: labels,
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
          data: a,
          borderColor: "blue",
          backgroundColor: transparentize(CHART_COLORS.blue, 0.5),
        },
        {
          label: "Video Flags",
          data: v,
          borderColor: "orange",
          backgroundColor: transparentize(CHART_COLORS.orange, 0.5),
        },
        {
          label: "Keys Flags",
          data: k,
          borderColor: "green",
          backgroundColor: transparentize(CHART_COLORS.green, 0.5),
        },
        {
          label: "Browser Flags",
          data: b,
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
                  <div className="stat-value">{faker.random.numeric()}</div>
                  <div className="stat-desc">lorem ipsum dolor etec</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Total Video Flags</div>
                  <div className="stat-value">{faker.random.numeric()}</div>
                  <div className="stat-desc">lorem ipsum dolor etec</div>
                </div>
              </div>
              <div className="stats shadow mt-4">
                <div className="stat">
                  <div className="stat-title">Total Keys Flags</div>
                  <div className="stat-value">{faker.random.numeric()}</div>
                  <div className="stat-desc">lorem ipsum dolor etec</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Total Browser Flags</div>
                  <div className="stat-value">{faker.random.numeric()}</div>
                  <div className="stat-desc">lorem ipsum dolor etec</div>
                </div>
              </div>
              <div className="stats shadow mt-4">
                <div className="stat">
                  <div className="stat-title">Total Flags</div>
                  <div className="stat-value">{faker.random.numeric(2)}</div>
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
              {activeTab === 1 && <Recordings />}
              {activeTab === 2 && <Keys />}
              {activeTab === 3 && <Browser />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Recordings = () => {
  const getData = () => {
    const data = [];

    for (let i = 1; i < 50; i++) {
      const gen = {
        id: i,
        name: `${faker.datatype.uuid()}.webm`,
        flagged: faker.datatype.boolean(),
        time: faker.date.between(
          moment().toDate(),
          moment().add(1, "h").toDate()
        ),
      };
      data.push(gen);
    }

    return data;
  };
  return (
    <div className="mt-5 overflow-y-scroll h-screen">
      {getData().map((data) => (
        <div
          className="indicator w-full mt-3 "
          onClick={() => {
            window
              .open(
                "https://dl8.webmfiles.org/big-buck-bunny_trailer.webm",
                "_blank"
              )
              ?.focus();
          }}
        >
          {data.flagged && (
            <span className="indicator-item indicator-start badge badge-secondary ml-3"></span>
          )}
          <div className="card w-full bg-base-100 hover:bg-base-300 shadow-sm cursor-pointer  ">
            <div className="card-body p-5">
              <p>{`(${moment(data.time).format("LTS")})`}</p>
              <p>
                Frame {data.id} - {data.name}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Keys = () => {
  const getData = () => {
    const data = [];

    for (let i = 1; i < 50; i++) {
      const gen = {
        id: i,
        data: faker.commerce.productDescription(),
        flagged: faker.datatype.boolean(),
        time: faker.date.between(
          moment().toDate(),
          moment().add(1, "h").toDate()
        ),
      };
      data.push(gen);
    }

    return data;
  };
  return (
    <div className="mt-5 overflow-y-scroll h-screen">
      {getData().map((data) => (
        <div className="indicator w-full mt-3 ">
          {data.flagged && (
            <span className="indicator-item indicator-start badge badge-secondary ml-3"></span>
          )}
          <div className="card w-full bg-base-100 hover:bg-base-300 shadow-sm ">
            <div className="card-body p-5">
              <p>{`(${moment(data.time).format("LTS")})`}</p>
              <kbd className="kbd kbd-sm">{data.data}</kbd>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Browser = () => {
  const getData = () => {
    const data = [];

    for (let i = 1; i < 50; i++) {
      const gen = {
        id: i,
        data: `[${
          faker.datatype.boolean() ? "OPENED" : "CLOSED"
        }] ${faker.internet.url()} - ${faker.random.words()}, FOCUS: ${
          faker.datatype.boolean() ? "true" : "false"
        }`,
        flagged: faker.datatype.boolean(),
        time: faker.date.between(
          moment().toDate(),
          moment().add(1, "h").toDate()
        ),
      };
      data.push(gen);
    }

    return data;
  };
  return (
    <div className="mt-5 overflow-y-scroll h-screen">
      {getData().map((data) => (
        <div className="indicator w-full mt-3 ">
          {data.flagged && (
            <span className="indicator-item indicator-start badge badge-secondary ml-3"></span>
          )}
          <div className="card w-full bg-base-100 hover:bg-base-300 shadow-sm ">
            <div className="card-body p-5">
              <p>{`(${moment(data.time).format("LTS")})`}</p>
              <kbd className="kbd kbd-sm">{data.data}</kbd>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MonitoringDetail;
