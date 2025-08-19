export type RootStackParamList = {
  Search: undefined;
  Profile: {
    login: string;
  };
};

export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: any; // We'll type this properly when we add React Navigation
  route: {
    params: RootStackParamList[T];
  };
};
