const Schedule = require('../models/scheduleModel');

exports.setAvailability = async (req, res) => {
  try {
    const { worker, availableSlots } = req.body;
    let schedule = await Schedule.findOne({ worker });
    if (!schedule) schedule = new Schedule({ worker, availableSlots: [], appointments: [] });
    schedule.availableSlots = availableSlots;
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { worker, client, date, start, end } = req.body;
    let schedule = await Schedule.findOne({ worker });
    if (!schedule) return res.status(404).json({ error: 'No hay agenda para este trabajador' });
    schedule.appointments.push({ client, date, start, end });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    const { workerId } = req.params;
    const schedule = await Schedule.findOne({ worker: workerId });
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
