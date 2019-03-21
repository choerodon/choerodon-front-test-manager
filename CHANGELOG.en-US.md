# Changelog

All notable changes to choerodon-front-agile will be documented in this file.

## [0.8.0] - 2018-07-19

### Add

- Add the test management function front module
- Users can use the website to manage their own test cases and test execution
- Test results can be easily managed in the agile module
- Test result can be display as report

## [0.9.0] - 2018-08-17
### Add

### 0.9.0 Significantly added features

- Add multi-language interface,can be used for multi-language switching with the platform
- Add dashboard display interface
- The execution list adds a quick pass button, and if the test passes, it is not necessary to click on the details to adjust the execution state
- Increase the cycle export function, the user can export the contents of the cycle to excel
- Increase cycle cross-version cloning, users can copy test cycle to other versions for reuse
- Test cycle details table telescopic display, optimize the table content display after the tree diagram is collapsed
- Add some unit tests
- Add some api tests
- Added name verification when creating test cases
- The problem number increases the url, and the user does not have to switch to the agile interface to view the defect
- The cycle url is added to the execution record in the use case details, and the user can jump directly in the execution form in the use case details
- The default search of `use case management`, you do not need to select the field and then select it
- `Cycle Details` intetface increase according to personnel screening function,users can filter assignees or performers
- Support for redirect to new defect page when associating defects

### Modify

#### 0.9.0 Significantly modify the feature

- Optimized query interfaces such as reports, test cycle, test steps, and defects
- Event message changed to saga mode
- Test status icon style change
- `Test Summary` page interface integration optimization
- `Test Case Management` page to increase the display content
- `Test case management` remove extra sort fields
- Test execution can be edit in table
- Test strp in `Test Case Management` can be edit in table
- Optimize the `Report` page layout,column width does not change due to expansion

### Fix

#### 0.9.0 Significant repair features

- Fix `test cycle` and step pagination display problem
- Fix the problem that the count after deleting the test case will not be cascaded deleted
- Fix the problem that the page after execution is not automatically refreshed globally
- Fix execution details interface width compatibility error causes the editor button not to be seen
- Fixed a problem with pagination data error in `report`

## [0.10.0] - 2018-09-30

### Add

#### 0.10.0 Significantly added features

- Changes layout of `test case management` page,The sidebar has two types of width and narrow type to display
- `Test case management` page to add classification of use cases（folder）
- Added `test plan` function
- `Test execution` added user filtering function

### Modify

#### 0.10.0 Significantly modify the feature

- The start and end time of the `test cycle` and `test phase` become mandatory
- Test execution will no longer be directly included in the `test cycle`
- When the `test case` is created, the version becomes mandatory and the folder becomes optional.
- The `Test cycle` interface changed to the `test execution` interface
- Test execution interface cannot edit test plan
- Report removes the function of select cases
- Reports show all items which have test connection by default
- Reports add test case filtering function
- The execution details page which transitions in report cannot edit

### Fix

#### 0.10.0 Significant repair features

- Fix the save operation of the edit in the table
- Fix some style issues
- Fix the style problem of dragging the table without searching for data

## [0.11.0] - 2018-09-30

### Add

#### 0.11.0 Significantly added features

- Test case can import through template excel file
- Test case export function
- Test execution details page add before/next button

### Modify

#### 0.11.0 Significantly modify the feature

- Test plan export changed to asynchronous modification, adding progress bar
- Test case folder copying and moving support batch mode
- Test phase folder added version display
- Test phase has a default time
- Test step added drag scroll
- Test execution page hides empty cycle
- The version of the test summary page is sorted by creation time
- Test case sorted by creation time desc
- Save the status of sidebar in test execution and test plan page
- Create a test step doesn't show up a new page, insert a new row in the table for editing
- Test step copy icon changed to button

### Fix

#### 0.11.0 Significant repair features

- Test case folder page don't scrolling when copy or drag folder
- Test plan page scroll problem
- Old values appear when table edits are saved
- Test plan, test execution table style adjustment
- Don't return to the first page after modifying the test case


## [0.12.0] - 2018-12-14

### Add

#### 0.12.0 Significantly added features

- Add `Automation Test` module
- Add `Automation Test` type of issue
- `Automation Test Issue` only used for automation test. Can not edit, drug.

### Modify

#### 0.12.0 Significantly modify the feature

- Update dashboard and icon
- Add assign in batches function in the `Test Plan` moudle
- Show the priority in `Test Plan` and `Test Execution` moudle
- Add filter with priority in `Test Plan` and `Test Execution` moudle
- Change the position of issue name in `Execution Details` moudle

### Fix

#### 0.12.0 Significant repair features

- Fix the bug of data  in `Test Plan` and `Test Execution` when switching project
- Fix the bug of data in test step when switching the previous\next in the execution details
- Fix problems of data display in dashboard

## [0.13.0] - 2019-01-11

### Modify

#### 0.13.0 Significantly modify the feature

- Optimize the calendar component in `Test Plan` module.
- Optimize the defect correlation function in `Test Execution` .

### Fix

#### 0.13.0 Significant repair features

- Fix the permission matching problem when delete a test case or folder in `Test Case` .

## [0.14.0] - 2019-02-22

### Add

#### 0.14.0 Significantly added features

- Add `Test Results Report(color piece show)`.
- Add `Test Automation Framework` support- `TestNG`.

### Modify

#### 0.14.0 Significantly modify the feature

- Optimize `Execution Details` interface display.
- Optimize `Test Steps` cloning sorting operation.
- Optimize `Test Plan` page.
- Optimize `Test Plan` export function data sorting, operation.
- Optimize time display.
- Optimize `Custom Status` components of color card.
- Optimize `Test Cases` interface display Gantt chart - optimization `Test Plan` page edge rolling.
- Optimize `Tree` components according to the version.
- Optimize `Create Use Case` on version restrictions.
- Optimize `Test Execution` page.

### Fix

#### 0.14.0 Significant repair features

- Fix `Testing Phase` associated use case folder version shows error.
- Fix `Rich Text Edit Box` paste image repeating mistakes.
- Fix `Test Digest` page scrolling page form errors.
- Fix `Test Plan` page in the gantt chart change time produce a page fault.
- Fix `Create Bugs` is agent cannot search problem.
- Fix dragging in `Test Plans` modify specific date error problem.
- Fix `Test Defect Report` specific data show the wrong questions.

## [0.15.0] - 2019-03-22

### Add

#### 0.15.0 Significantly added features

- Add Filtering by label in `Test Case`
- Add related story features when creating defects in `Test Execution` details
- Add sort function for `Test Phase`in same `Test cycle`
- Add init demo data function

### Modify

#### 0.15.0 Significantly modify the feature

- Optimize the risk of prompting the removal of version operations for test data
- Optimize `Test Case` import function
- Optimize display details in the `Test Plan` page

### Fix

#### 0.15.0 Significant repair features

- Fix the problem in `Test Execution` details when page turning
- Fix the problem in the `Test Plan` tree that is inconsistent with the detail progress bar on the right
- Fix the problem of url link error in `Test Case`
- Fix the problem of assigned to field could not be updated in the `Test Plan`
- Fix the problem of could not add an new defects in the `Test Execution` details