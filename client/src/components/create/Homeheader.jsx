import logo from "/logo.png";
import notif from "/notification.png";
import msg from "/msg.png";
import user from "/user.png";

const Homeheader = () => {
  return (
    <div className="flex justify-between items-center">
      <img src={logo} alt="" className="logo w-[180px] md:w-[250px]" />
      <div className="flex gap-5 items-center">
        <div className="relative">
          <img src={notif} alt="" className="cursor-pointer user w-6" />
          <div className="w-[5px] h-[5px] absolute top-0 right-0 bg-red-500 rounded-full"></div>
        </div>
        <div className="relative">
          <img src={msg} alt="" className="cursor-pointer user w-6" />
          <div className="absolute -top-2 -right-1 text-xs text-red-500">2</div>
        </div>
        <img src={user} alt="" className="cursor-pointer user w-7" />
      </div>
    </div>
  );
};

export default Homeheader;
