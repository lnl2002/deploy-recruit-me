"use client";
import { useCallback, useEffect, useState } from "react";

import { Plus, Search } from "lucide-react";
import { Button, Input, useDisclosure } from "@nextui-org/react";
import { useRouter } from "next/navigation";

import JobSection from "./components/jobSection";
import FilterSection from "./components/filterSection";
import { debounce } from "@/utils/debounce";
import accountApi, { IAccount } from "@/api/accountApi/accountApi";
import AddAccount from "./components/addAccount";
import unitApi, { TUnit } from "@/api/unitApi";
import roleApi, { TRole } from "@/api/roleApi";

export const ListAccount = (): React.JSX.Element => {
  const disclosure = useDisclosure();
  const [limit] = useState(10);
  const [accountTotal, setAccountTotal] = useState<number>(0);
  const [listAccount, setListAccount] = useState<IAccount[] | []>([]);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [units, setUnits] = useState<TUnit[]>([]);
  const [roles, setRoles] = useState<TRole[]>([]);

  // Debounced fetch only for search input
  const fetchJobsBySearch = useCallback(
    debounce(async (searchTerm: string) => {
      const { accounts, total } = await accountApi.getListAccountForAdmin({
        limit,
        page: currentPage,
        role: filterValue,
        name: searchTerm,
      });
      setListAccount(accounts);
      setAccountTotal(total);
    }, 500),
    [currentPage, filterValue, limit]
  );

  // Fetch data when filters or pagination changes
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    const { accounts, total } = await accountApi.getListAccountForAdmin({
      limit,
      page: currentPage,
      role: filterValue,
      name: search,
    });
    setListAccount(accounts);
    setIsLoading(false);
    setAccountTotal(total);
  }, [currentPage, filterValue, search, limit]);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, filterValue, fetchJobs]);

  // Handle search input with debounce
  useEffect(() => {
    fetchJobsBySearch(search);
  }, [search, fetchJobsBySearch]);

  const handleChangePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getUnits = async () => {
    const { units } = await unitApi.getUnitList();
    setUnits(units);
  };

  const getRole = async () => {
    const { roles } = await roleApi.getRoleList();
    setRoles(roles);
  };

  useEffect(() => {
    getUnits();
    getRole();
  }, [])

  return (
    <div className="flex justify-center">
      <div className="w-[85vw] flex flex-col gap-5 py-6">
        <div className="w-full flex justify-between">
          <h1 className="font-bold text-themeDark text-3xl">List Account</h1>
          <div>
            <Button
              radius="full"
              className="bg-themeOrange text-themeWhite px-12"
              startContent={<Plus color="#FFF" size={18} />}
              onPress={() => disclosure.onOpen()}
            >
              Create New Account
            </Button>
          </div>
        </div>
        <div className="grid grid-flow-col grid-cols-5">
          <div className="col-span-1">
            <FilterSection
              setFilterValue={setFilterValue}
              filterValue={filterValue}
              setCurrentPage={setCurrentPage}
            />
          </div>
          <div className="col-span-4">
            <div className="flex justify-between mb-6">
              <Input
                placeholder="Search Name"
                startContent={<Search className="text-themeDark" />}
                className="max-w-[300px]"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <JobSection
              listAccount={listAccount ?? []}
              totalPage={Math.ceil(accountTotal / limit)}
              filterValue={filterValue}
              handleChangePage={handleChangePage}
              isLoading={isLoading}
              fetchJobs={fetchJobs}
            />
          </div>
        </div>
      </div>
      <AddAccount
        isOpen={disclosure.isOpen}
        onConfirm={() => console.log("tesst")}
        onOpenChange={disclosure.onOpenChange}
        roles={roles}
        units={units}
        fetchJobs={fetchJobs}
      />
    </div>
  );
};
