const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
  room: String         // e.g. "D40"
});

//emails allowed to book on system

// const allowedEmails = [
//   "matthew.cupido@ardaghgroup.com",
//   "zainap.van-blerck@ardaghgroup.com",
//   "Amier.Osman@ardaghgroup.com",
//   "Eric.Mukhawa@ardaghgroup.com",
//   "Daniel.Bates@ardaghgroup.com",
//   "Khakhu.Livhalani@ardaghgroup.com",
//   "Divesh.Seevnarain@ardaghgroup.com",
//   "Tsakani.Mafuiane@ardaghgroup.com",
//   "Raisibe.Seroka@ardaghgroup.com",
//   "Eulender.Kganyago@ardaghgroup.com",
//   "Barend.DeWet@ardaghgroup.com",
//   "Karen.VanTonder@ardaghgroup.com",
//   "Lukhwa.Faranani@ardaghgroup.com",
//   "Calista.Madlala@ardaghgroup.com",
//   "Thabo.Makhanya@ardaghgroup.com",
//   "Thibello.Motebang@ardaghgroup.com",
//   "Keitumetse.Nokiase@ardaghgroup.com",
//   "Amokelane.Maluleke@ardaghgroup.com",
//   "Seleen.De-Fleurs@ardaghgroup.com",
//   "Tania.Shumba@ardaghgroup.com",
//   "Precious.Chauke@ardaghgroup.com",
//   "Kamogelo.Ledwaba@ardaghgroup.com",
//   "Gomolemo.Nhlapo@ardaghgroup.com",
//   "Mohau.Mokotedi@ardaghgroup.com",
//   "Ndivhudza.Tshivhenga@ardaghgroup.com",
//   "Itumeleng.Modisang@ardaghgroup.com",
//   "Rirhadzu.Mahlaule@ardaghgroup.com",
//   "Hlamalani.Mashaba@ardaghgroup.com",
//   "Khangwelo.Maphanda@ardaghgroup.com",
//   "Kedibone.Mokoena@ardaghgroup.com",
//   "Msekeli.Mkwibiso@ardaghgroup.com",
//   "Thamsanqa.Menzi@ardaghgroup.com",
//   "Simphiwe.Zwane@ardaghgroup.com",
//   "Nomagugu.Mkhize@ardaghgroup.com",
//   "Tebogo.Mooi@ardaghgroup.com",
//   "Thabo.Mntambo@ardaghgroup.com",
//   "Guilleame.Maritz@ardaghgroup.com",
//   "Tendi.Mukhodobwane@ardaghgroup.com",
//   "Sakhile.Manana@ardaghgroup.com",
//   "Warren.Windvogel@ardaghgroup.com",
//   "Phaladi.Monyepao@ardaghgroup.com",
//   "Thabiso.Malunga@ardaghgroup.com",
//   "Hasshiem.Booley@ardaghgroup.com",
//   "Phumlani.Mtshali@ardaghgroup.com",
//   "Sabelo.Simelane@ardaghgroup.com",
//   "Mlungisi.Jamela@ardaghgroup.com",
//   "Kevin.Sulaiman@ardaghgroup.com",
//   "Fernando.Estavao@ardaghgroup.com",
//   "Christiaan.Jansen-van-Vuuren@ardaghgroup.com",
//   "Ludwe.Petros@ardaghgroup.com",
//   "Athenkosi.Marobo@ardaghgroup.com",
//   "Eugene.Sentle@ardaghgroup.com",
//   "Odwa.Mvimbi@ardaghgroup.com",
//   "Ncebayakhe.Masangwana@ardaghgroup.com",
//   "Tshifhiwa.Nengwane@ardaghgroup.com",
//   "Phaphama.Kangelani@ardaghgroup.com",
//   "Tasneem.Ahomed@ardaghgroup.com",
//   "Rein.Leroux@ardaghgroup.com",
//   "Rameez.Davids@ardaghgroup.com",
//   "Gail.Davids@ardaghgroup.com",
//   "Thapelo.Moliea@ardaghgroup.com",
//   "Babalwa.Mgaguli@ardaghgroup.com",
//   "Sibu.Magubane@ardaghgroup.com",
//   "shameega.frantz@exlservice.com",
//   "brandon.sousa@exlservice.com",
//   "khayakazi.mvandaba@exlservice.com",
//   "Lisakanya.Ntshwanti@exlservice.com"
 
// ];


// module.exports = allowedEmails;

bookingSchema.index({ date: 1, room: 1 }, { unique: true }); // Prevent double-booking same room on same date

module.exports = mongoose.model("Booking", bookingSchema);
