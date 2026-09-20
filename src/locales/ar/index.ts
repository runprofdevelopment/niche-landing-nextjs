import { composeMessages } from "@/locales/compose-messages";

import auth from "./auth";
import common from "./common";
import dashboard from "./dashboard";
import dataTable from "./data-table";
import errors from "./errors";
import events from "./events";
import invitations from "./invitations";
import meta from "./meta";
import navigation from "./navigation";
import registrationUsers from "./registration-users";
import requests from "./requests";
import roles from "./roles";
import security from "./security";
import settings from "./settings";
import staff from "./staff";

export default composeMessages({
  auth,
  common,
  dashboard,
  dataTable,
  errors,
  events,
  invitations,
  meta,
  navigation,
  registrationUsers,
  requests,
  roles,
  security,
  settings,
  staff,
});
