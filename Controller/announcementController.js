const Announcement = require("../Model/Announcement");

// ================= CREATE (ADMIN) =================
const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user._id
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL (ADMIN + MEMBER) =================
const getAnnouncements = async (req, res) => {
  try {
    const list = await Announcement.find()
      .sort({ createdAt: -1 });

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE (ADMIN) =================
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Not found" });
    }

    await announcement.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement
};
