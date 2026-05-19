"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

export function InitBusiness() {
  const business = useQuery(api.business.get);
  const seedDefaults = useMutation(api.business.seedDefaults);

  useEffect(() => {
    if (business === null) {
      void seedDefaults();
    }
  }, [business, seedDefaults]);

  return null;
}
