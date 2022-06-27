import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(...registerables);
import colorLib from "@kurkle/color";
import { useNavigate } from "react-router-dom";
import { faker } from "@faker-js/faker";
import moment from "moment";
import { useEffect } from "react";
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

const participants = () => {
  const data = [];
  for (let i = 30; i > 0; i--) {
    const random = {
      id: i,
      time: faker.date.between(
        moment().toDate(),
        moment().add(1, "h").toDate()
      ),
      email: faker.internet.email(),
      audio: parseInt(faker.random.numeric()),
      video: parseInt(faker.random.numeric()),
      keys: parseInt(faker.random.numeric()),
      browser: parseInt(faker.random.numeric()),
    };

    data.push({
      ...random,
      total: random.audio + random.video + random.keys + random.browser,
    });
  }
  return data;
};

const Monitoring = () => {
  useEffect(() => {
    document.title = "Session Monitoring | Overview";
  }, []);
  const navigate = useNavigate();
  const GRAPH_DATA = {
    labels: [
      "11:00",
      "11:01",
      "11:02",
      "11:03",
      "11:04",
      "11:05",
      "11:06",
      "11:07",
      "11:08",
      "11:09",
      "11:10",
      "11:11",
      "11:12",
      "11:13",
      "11:14",
      "11:15",
      "11:16",
      "11:17",
      "11:18",
      "11:19",
      "11:20",
      "11:20",
      "11:25",
      "11:30",
    ],
    datasets: [
      {
        label: "Falgged participants",
        data: [
          0, 3, 2, 4, 1, 9, 0, 0, 0, 0, 4, 2, 7, 10, 2, 4, 0, 1, 2, 0, 2, 4, 6,
          4, 3, 10, 4, 5,
        ],
        borderColor: "red",
        backgroundColor: transparentize(CHART_COLORS.red, 0.5),
        pointStyle: "circle",
        pointRadius: 10,
        pointHoverRadius: 15,
      },
    ],
  };
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
            <div className="stat-value">30</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Audio Flags</div>
            <div className="stat-value">{faker.random.numeric(2)}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Video Flags</div>
            <div className="stat-value">{faker.random.numeric(2)}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Keys Flags</div>
            <div className="stat-value">{faker.random.numeric(2)}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Browser Flags</div>
            <div className="stat-value">{faker.random.numeric(2)}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Flags</div>
            <div className="stat-value">{faker.random.numeric(3)}</div>
            <div className="stat-desc">lorem ipsum dolor etec</div>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <Line data={GRAPH_DATA} />
      </div>
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
              {participants().map((part) => (
                <tr
                  className="cursor-pointer"
                  onClick={() => navigate(`/monitoring/${part.id}`)}
                >
                  <th>{part.id}</th>
                  <td>{part.email}</td>
                  <td>{moment(part.time).format("LTS")}</td>
                  <td>{part.audio}</td>
                  <td>{part.video}</td>
                  <td>{part.keys}</td>
                  <td>{part.browser}</td>
                  <td>{part.total}</td>
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
