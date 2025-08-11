export const BRAND = {
  company: "StephensCode LLC",
  phone: "(936) 323-4527",
  outreachTitle: "Client Outreach Specialist",
  clientTitle: "Client Success Manager",
  legalFooter: "StephensCode LLC • All rights reserved"
};

export function signature(first: string, last: string, email: string, title: "client"|"outreach") {
  const role = title === "client" ? BRAND.clientTitle : BRAND.outreachTitle;
  return `${first} ${last}
${role}
${BRAND.company}
${BRAND.phone}
${email}`;
}
