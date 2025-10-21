import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import addMonths from "date-fns/addMonths";
import subMonths from "date-fns/subMonths";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { plansData } from "../data/plansData.js";


const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Convert plansData into calendar format
    const formattedEvents = plansData.flatMap((plan) => {
      const events = [];

      if (plan.confirmed && plan.hangoutDate) {
        events.push({
          title: `${plan.title} 🎉`,
          start: new Date(plan.hangoutDate),
          end: new Date(plan.hangoutDate),
          allDay: true,
          type: "hangout",
        });
      }

      if (plan.deadline) {
        events.push({
          title: `${plan.title} (Deadline ⏰)`,
          start: new Date(plan.deadline),
          end: new Date(plan.deadline),
          allDay: true,
          type: "deadline",
        });
      }

      return events;
    });

    setEvents(formattedEvents);
  }, []);

  // navigation
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="h-screen flex flex-col items-center p-6">
      {/* Inline style overrides */}
      <style>
        {`
          /* Remove all inner borders but keep the outer one */
          .rbc-month-view,
          .rbc-month-row,
          .rbc-row-bg,
          .rbc-day-bg
         {
            border: none !important;
          }

          /* Remove inner vertical and horizontal lines */
          .rbc-day-bg + .rbc-day-bg {
            border-left: 1px solid #DAA06D !important;
          }
          .rbc-month-row + .rbc-month-row {
            border-top: 1px solid #DAA06D !important;
          }
            
          /* Remove bottom border under weekday names */
          .rbc-header {
            border-bottom: none !important;
            border-right: none !important;
          }
         .rbc-header + .rbc-header {
            border-left: none !important;
          }
          .rbc-header.rbc-today {
            border: none !important;
          }
    


        `}
      </style>
      {/* Custom Toolbar */}
      <div className="flex items-center justify-between w-75 max-w-5xl mb-4">
        <button
          onClick={goToPrevMonth}
          className="text-2xl font-bold hover:text-gray-600"
        >
          &lt;
        </button>

        <h1 className="text-3xl font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h1>

        <button
          onClick={goToNextMonth}
          className="text-2xl font-bold hover:text-gray-600"
        >
          &gt;
        </button>
      </div>

      {/* Calendar */}
      <div className="h-[100vh] w-full max-w-5xl rounded-2xl shadow-md  p-4 ">
        <BigCalendar
          localizer={localizer}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={["month"]} // Only month view
          toolbar={false} // Removes default toolbar
          eventPropGetter={(event) => {
            const backgroundColor =
              event.type === "hangout" ? "#34D399" : "#FBBF24";
            return {
              style: {
                backgroundColor,
                borderRadius: "6px",
                color: "black",
                border: "none",
                padding: "2px 4px",
              },
            };
          }}
        />
      </div>
    </div>
  );
};

export default Calendar;
