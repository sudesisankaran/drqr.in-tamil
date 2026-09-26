export const generateSlots = () => {
  const slots = [];
  let start = 10 * 60; // 10:00 AM
  let end = 18 * 60;   // 6:00 PM

  for (let i = start; i < end; i += 15) {
    const hour = Math.floor(i / 60);
    const min = i % 60;

    slots.push(
      `${hour.toString().padStart(2, "0")}:${min
        .toString()
        .padStart(2, "0")}`
    );
  }

  return slots;
};


// slots.map((slot) => (
//   <button
//     disabled={!slot.available}
//     className={`px-4 py-2 rounded ${
//       slot.available ? "bg-green-500" : "bg-gray-400"
//     }`}
//   >
//     {slot.time} ({slot.booked}/2)
//   </button>
// ))