import Trofeu from "@/src/models/trofeuModel";

// app/NavigationTypes.ts
export type RootStackParamList = {
    "(tabs)/index": undefined;
    "(tabs)/teste": undefined;
    "(tabs)/cadastro": undefined;
    "(tabs)/dashboard": undefined;
    "(tabs)/login": undefined;
    "(tabs)/guiaToken": undefined;
    "(tabs)/trophyList": {trofeus: Trofeu[]};
};