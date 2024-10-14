import careerApi, { TCareer } from "@/api/careerApi";
import locationApi, { TLocation } from "@/api/locationApi";
import unitApi, { TUnit } from "@/api/unitApi";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type FilterJobProps = {
  setSearchTitle: (title: string) => void;
  setSelectedLocationId: (locationId: string) => void;
  setSelectedUnitId: (unitId: string) => void;
  setSelectedCareerId: (unitId: string) => void;
};

const FilterJob: React.FC<FilterJobProps> = ({
  setSearchTitle,
  setSelectedLocationId,
  setSelectedUnitId,
  setSelectedCareerId,
}): React.JSX.Element => {
  const [unitList, setUnitList] = useState<TUnit[]>([]);
  const [locationList, setLocationList] = useState<TLocation[]>([]);
  const [careerList, setCareerList] = useState<TCareer[]>([]);

  useEffect(() => {
    (async () => {
      const { units } = await unitApi.getUnitList();
      const { locations } = await locationApi.getLocationList();
      const { careers } = await careerApi.getCareerList();
      setUnitList(units);
      setLocationList(locations);
      setCareerList(careers);
    })();
  }, []);

  console.log({ unitList, locationList, careerList });

  // Handler for when the user selects a unit
  const handleSelectUnit = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const unitId = event.target.value;
    setSelectedUnitId(unitId);
  };

  // Handler for when the user selects a locationId
  const handleSelectLocation = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const locationId = event.target.value;
    setSelectedLocationId(locationId);
  };

  // Handler for when the user selects a locationId
  const handleSelectCareer = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const careerId = event.target.value;
    setSelectedCareerId(careerId);
  };

  const handelOnchangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchTitle(searchValue);
  };

  return (
    <div className="col-span-1 mx-12 flex flex-col gap-5">
      <Input
        variant="bordered"
        placeholder="Find a job"
        aria-label="Find a job"
        classNames={{ input: "text-[#000]" }}
        startContent={<Search color="#999" />}
        onChange={handelOnchangeSearch} // Update the search title on change
      />
      <Select
        label="Work Unit"
        fullWidth
        variant="bordered"
        size="sm"
        radius="lg"
        onChange={handleSelectUnit} // Handle selection change
      >
        {unitList.map((unit) => (
          <SelectItem
            className="text-themeDark"
            key={unit._id}
            value={unit._id}
          >
            {unit.name}
          </SelectItem>
        ))}
      </Select>
      <Select
        label="Location"
        fullWidth
        variant="bordered"
        size="sm"
        radius="lg"
        onChange={handleSelectLocation} // Handle selection change
      >
        {locationList.map((location) => (
          <SelectItem
            className="text-themeDark"
            key={location._id}
            value={location._id}
          >
            {location.city}
          </SelectItem>
        ))}
      </Select>
      <Select
        label="Career"
        fullWidth
        variant="bordered"
        size="sm"
        radius="lg"
        onChange={handleSelectCareer} // Handle selection change
      >
        {careerList.map((career) => (
          <SelectItem
            className="text-themeDark"
            key={career._id}
            value={career._id}
          >
            {career.name}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default FilterJob;
