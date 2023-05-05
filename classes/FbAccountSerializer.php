<?php

class FbAccountSerializer
{
    private string $filename;

    public function __construct($filename)
    {
        $this->filename = $filename;
    }

    public function serialize(array $facebookAccounts): void
    {
        $accountsData = [];
        foreach ($facebookAccounts as $account) {
            $accountsData[] = $account->toArray();
        }

        $json = json_encode($accountsData, JSON_PRETTY_PRINT);
        file_put_contents($this->filename, $json);
    }

    public function deserialize(): array
    {
        if (!file_exists($this->filename)) return [];
        $json = file_get_contents($this->filename);
        $data = json_decode($json, true);

        $facebookAccounts = [];

        foreach ($data as $accountData) {
            $facebookAccounts[] = FbAccount::fromArray($accountData);
        }

        return $facebookAccounts;
    }

    public function getAccountByName($name): ?FbAccount
    {
        $accounts = $this->deserialize();
        $filteredAccounts = array_filter($accounts, function ($account) use ($name) {
            return $account->name === $name;
        });
        return !empty($filteredAccounts) ? reset($filteredAccounts) : null;
    }

    public function deleteAccountByName($name): array
    {
        // Deserialize the accounts from the JSON file
        $facebookAccounts = $this->deserialize();

        // Remove the account with the matching name
        $facebookAccounts = array_filter($facebookAccounts, function ($account) use ($name) {
            return $account->name !== $name;
        });

        // Re-index the array
        $facebookAccounts = array_values($facebookAccounts);

        // Serialize the updated array of accounts back to the JSON file
        $this->serialize($facebookAccounts);

        // Return the updated array of accounts
        return $facebookAccounts;
    }
}