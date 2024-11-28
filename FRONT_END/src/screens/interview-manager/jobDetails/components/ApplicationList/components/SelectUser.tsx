import { Avatar, Chip, Select, SelectItem } from "@nextui-org/react";
import React, { useEffect } from "react";

interface SelectUserProps {
  users: Array<{
    _id: string;
    email: string;
    name: string;
    image: string;
  }>;
  setParticipants: (list: string[]) => void
}


const SelectUser: React.FC<SelectUserProps> = ({users, setParticipants}) => {
  useEffect(() => {
    if(users)
      setParticipants(users.map(user => user._id))

    
  }, [])
  return (
    <Select
      items={users}
      label="Participants"
      variant="bordered"
      isMultiline={true}
      selectionMode="multiple"
      placeholder="Select a user"
      labelPlacement="outside"
      classNames={{
        base: "w-full text-themeDark",
        trigger: "min-h-12 py-2",
        listbox: "text-themeDark",
        label: "min-w-[100px] flex items-center justify-center mt-1"
      }}
      renderValue={(items: any) => {
        return (
          <div className="flex flex-wrap gap-2 ">
            {items.map((item: any) => (
              <Chip key={item.key} classNames={{
                content: "flex gap-1 items-center",
                base: "py-5"
              }}>
                <Avatar
                  alt={item.data.name}
                  size="sm"
                  src={item.data.image}
                  key={item?.data?.image || ''}
                />
                <div>{item.data.name}</div>
                </Chip>
            ))}
          </div>
        );
      }}
      defaultSelectedKeys={users.slice(0, 2).map(user => user._id)}
      onChange={(e) => setParticipants(e.target.value.split(","))}
    >
      {(user) => (
        <SelectItem key={user._id} textValue={user.name}>
          <div className="flex gap-2 items-center">
            <Avatar
              alt={user.name}
              className="flex-shrink-0"
              size="sm"
              src={user.image}
            />
            <div className="flex flex-col">
              <span className="text-small">{user.name}</span>
              <span className="text-tiny text-default-400">{user.email}</span>
            </div>
          </div>
        </SelectItem>
      )}
    </Select>
  );
};

export default SelectUser;
