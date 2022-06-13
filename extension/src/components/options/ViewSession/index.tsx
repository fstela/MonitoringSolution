import OptionsContext from "@src/pages/options/context";
import React, { useContext } from "react";

const SessionMonitoring: React.FC = () => {
  const context = useContext(OptionsContext);
  return (
    <div className="mt-10">
      <div className="grid grid-cols-12 mb-10">
        <h1 className="font-bold text-lg col-span-9">Session View</h1>
        <button className="btn btn-primary btn-md col-span-3">Add participants</button>
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
            <tr>
              <th>1</th>
              <td>ceva@ceva.com</td>
              <td>Blue</td>
              <td>dadasda-dadasd-adasd-asdasd</td>
              <td>
                <button className="btn btn-error btn-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <p>monitor session {JSON.stringify(context)}</p>
      </div>
    </div>
  );
};

export default SessionMonitoring;
