import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(...registerables);
import colorLib from "@kurkle/color";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useEffect, useState } from "react";
import { createClient } from "@src/api/ApiService";
import SessionService from "@src/api/SessionService";
import toast from "react-hot-toast";
import { SessionMonitoringParticipant } from "@src/api/types";
export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

export function transparentize(value: string, opacity: number) {
  var alpha = opacity === undefined ? 0.5 : 1 - opacity;
  return colorLib(value).alpha(alpha).rgbString();
}
const valueOrDefault = (val: any, def: any) => {
  return val ?? def;
};

export function rand(min: number, max: number, seed: number) {
  min = valueOrDefault(min, 0);
  max = valueOrDefault(max, 0);
  seed = (seed * 9301 + 49297) % 233280;
  return min + (seed / 233280) * (max - min);
}

const GRAPH_DATA = {
  labels: [] as string[],
  datasets: [
    {
      label: "Falgged participants",
      data: [] as number[],
      borderColor: "red",
      backgroundColor: transparentize(CHART_COLORS.red, 0.5),
      pointStyle: "circle",
      pointRadius: 10,
      pointHoverRadius: 15,
    },
  ],
};

const Monitoring = () => {
  const [graphData, setGrapData] = useState(GRAPH_DATA);
  const [participants, setParticipants] = useState<
    SessionMonitoringParticipant[]
  >([]);
  const [stats, setStats] = useState<
    | undefined
    | { noPart: number; a: number; v: number; k: number; b: number; t: number }
  >();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    document.title = "Session Monitoring | Overview";
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
    service.getSessionMonitoringData().then((response) => {
      const graph = GRAPH_DATA;
      const stats = { noPart: 0, a: 0, v: 0, k: 0, b: 0, t: 0 };
      response.data.graph.forEach((gd) => {
        graph.labels.push(moment(gd.date).format("LTS"));
        graph.datasets[0].data.push(gd.value);
      });
      response.data.participants.forEach((p) => {
        stats.noPart += 1;
        stats.a += p.a;
        stats.v += p.v;
        stats.k += p.k;
        stats.b += p.b;
        stats.t += p.a + p.v + p.k + p.b;
      });

      setGrapData({ ...graph });
      setParticipants(response.data.participants);
      setIsLoading(false);
      setStats(stats);
    });
  };

  const navigate = useNavigate();

  return (
    <div className="mt-10">
      <div className="grid grid-cols-12 mb-10 gap-2">
        <h1 className="font-bold text-lg col-span-9">Session Overview</h1>
        <button
          className="btn btn-primary btn-md col-span-3"
          onClick={() => navigate("/view")}
        >
          Manage Participants
        </button>
      </div>
      <div className="mb-5">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Participants</div>
            <div className="stat-value">{stats?.noPart ?? 0}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Audio Flags</div>
            <div className="stat-value">{stats?.a ?? 0}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Video Flags</div>
            <div className="stat-value">{stats?.v ?? 0}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Keys Flags</div>
            <div className="stat-value">{stats?.k ?? 0}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Browser Flags</div>
            <div className="stat-value">{stats?.b ?? 0}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Flags</div>
            <div className="stat-value">{stats?.t ?? 0}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
        </div>
      </div>
      <div className="mb-5">{!isLoading && <Line data={graphData} />}</div>
      <div>
        <div className="overflow-x-auto mt-4">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Started Time</th>
                <th>Audio Flags</th>
                <th>Video Flags</th>
                <th>Keys Flags</th>
                <th>Browser Flags</th>
                <th>Total Flags</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr
                  className="cursor-pointer"
                  onClick={() => navigate(`/monitoring/${p.id}`)}
                >
                  <th>{p.id}</th>
                  <td>{p.email}</td>
                  <td>{moment(p.startedAt).format("LTS")}</td>
                  <td>{p.a}</td>
                  <td>{p.v}</td>
                  <td>{p.k}</td>
                  <td>{p.b}</td>
                  <td>{p.a + p.v + p.k + p.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
