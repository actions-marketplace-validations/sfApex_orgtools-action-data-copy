# orgtools-action-data-copy

Start a data copy within the OrgTools application.

Example Usage:
```
jobs:
    deployment
        - name: Copy Test Data
            uses: sfApex/orgtools-action-data-copy@master
            with:
                datatemplatename: 'DataTemplateName'
                apiToken: 'a39966d6-7d90-4661-bd9c-a0945c1854e7'
```

### Input Arguments

|Argument|  Description  |  Default  |
|--------|---------------|-----------|
|datatemplatename     | Name of data template to use for data copy.   | _required_ |
|maxIterations  | Maximum automatic retries of data copy.| 3 |
|notificationEmailAddress  | Notication Email Recipient.||
|disableValidations    | Disable destination metadata during data copy. | true |
|replaceInactiveUsers| Replace references to inactive user Ids with your user Id. | true |
|useDefaultRecordType| Replace inactive and blank record type Ids with object's default record type Id. | true |
|apiToken| OrgTools API Token. ||

### Output

- `response` Request Response as JSON String
