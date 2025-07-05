// services.js en tu frontend
import axios from "axios";

export const getAllServices = async () => {
  const res = await axios.get("http://localhost:5000/api/services");
  return res.data;
};
