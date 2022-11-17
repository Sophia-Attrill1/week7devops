import {PencilIcon, PlusIcon, TrashIcon} from "@heroicons/react/outline";
import axios from "axios";
import {GetServerSideProps} from "next";
import useSession from "../hooks/useNextAuth";
import Head from "next/head";
import Link from "next/link";
import {useRouter} from "next/router";
import {useState} from "react";
import {useMutation} from "react-query";

import dbConnect from "../../lib/dbConnect";
import Room from "../../models/Room";
import Alert from "../components/Alert";
import Filter from "../components/Filter";

export default function Home({rooms}) {
  const [capacity, setCapacity] = useState(0);
  const [building, setBuilding] = useState([]);
  const [type, setType] = useState([]);
  const [roomSate, setRoomSate] = useState(rooms);
  const router = useRouter();
  const {data: session} = useSession();

  const handleCapacityChange = (n) => setCapacity(n);
  const handleBuildingChange = (b) => {
    return setBuilding(b);
  };
  const handleTypeChange = (t) => setType(t);
  const handleReset = () => setCapacity(1);

  const {isSuccess, isError, mutate} = useMutation(async (id: string) => {
    await axios.delete(`/api/rooms/${id}`);
    console.log("success");
    setRoomSate(roomSate.filter((r) => r._id !== id));
  });

  return (
    <div className="flex">
      <Head>
        <title>Solent Room Tracker</title>
        {process.env.NEXT_PUBLIC_TESTING}
        <meta name="description" content="Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Filter
        capacity={capacity}
        onCapacityChange={handleCapacityChange}
        onReset={handleReset}
        onTypeChange={handleTypeChange}
        onBuildingChange={handleBuildingChange}
      />
      <div className="min-w-full pr-20">
        <div className="max-w-[80%] mx-auto mt-11">
          <div>
            {session && (
              <Link href="/create">
                <a
                  className="blue-button mb-7"
                  data-cy="add-room-button"
                  data-test="add-room-button"
                >
                  <PlusIcon className="h-5 w-5" /> Add Room
                </a>
              </Link>
            )}

            {isSuccess && <Alert label="Room Deleted" variant="success" />}
            {isError && (
              <Alert label="Could not delete room" variant="warning" />
            )}
          </div>
          <div className="bg-white mx-auto mt-11 p-5 rounded-lg shadow-md">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs border-b-2 font-semibold text-gray-700 border-gray-200 bg-gray-100 rounded-tl-lg rounded-tr-lg">
                  <th className="p-3 rounded-tl-lg">Room Number</th>
                  <th>Building </th>
                  <th>Student Capacity</th>
                  <th>Type</th>
                  <th> </th>
                </tr>
              </thead>
              <tbody>
                {roomSate
                  .filter((r) => r.capacity >= capacity)
                  .filter((r) => {
                    if (!building.length) return true;
                    return building.find((b) => b === r.building);
                  })
                  .filter((r) => {
                    if (!type.length) return true;
                    return type.find((t) => t === r.type.code);
                  })
                  .map((r, i) => (
                    <tr
                      data-test="room-item"
                      key={r._id}
                      className={(i + 1) % 2 === 0 ? "bg-gray-100" : ""}
                    >
                      <td className="p-2 text-blue rounded-l-lg">
                        <Link href={`/rooms/${r._id}`}>
                          <a className="cursor-pointer font-semibold">
                            {r.building}
                            {r.number}
                          </a>
                        </Link>
                      </td>
                      <td> {r.building}</td>
                      <td> {r.capacity}</td>
                      <td className="rounded-r-lg">{r.type.name}</td>
                      {session && (
                        <td className="flex">
                          <PencilIcon
                            data-test="edit-icon"
                            className="h-6 w-6 mt-2 cursor-pointer"
                            onClick={() => router.push(`/rooms/${r._id}/edit/`)}
                          />
                          <TrashIcon
                            data-test="delete-icon"
                            className="h-6 w-6 mt-2 ml-6 cursor-pointer"
                            onClick={() => mutate(r._id)}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
            {/* <div className="mt-6 flex justify-between">
              <h3 className="text-sm mt-5">
                Showing <b>1</b> to <b>10</b> of <b>97</b> Results
              </h3>
              <div className="flex border-t-2 border-b-2 border-l-2 rounded-md">
                <div className="border-r-2 p-3">
                  <ChevronLeftIcon className="h-5 w-5" />
                </div>
                <div className="border-r-2 p-3">1</div>
                <div className="border-r-2 p-3">2</div>
                <div className="border-r-2 p-3">3</div>
                <div className="border-r-2 p-3">...</div>
                <div className="border-r-2 p-3">8</div>
                <div className="border-r-2 p-3">9</div>
                <div className="border-r-2 p-3">10</div>
                <div className="border-r-2 p-3">
                  <ChevronRightIcon className="h-5 w-5" />
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  await dbConnect();
  console.log(process.env.NODE_ENV);
  const results = await Room.find({}).lean();
  const rooms = results.map((doc) => ({
    ...doc,
    ...{_id: doc._id.toString()},
  }));

  return {props: {rooms: rooms}};
};
