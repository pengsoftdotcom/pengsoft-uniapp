<template>
    <view class="w-form-wrap">
        <u--form :labelWidth="75" :model="formModel" :rules="rules" ref="form">
            <u-form-item
                label="项　　目"
                prop="project"
                @click="showProjectPicker"
            >
                <u-picker
                    :show="projectPickerVisible"
                    :columns="[projects]"
                    keyName="shortName"
                    @cancel="hideProjectPicker"
                    @confirm="hideProjectPicker"
                ></u-picker>
                <u--input
                    v-model="formModel.project.shortName"
                    disabled
                    disabledColor="#ffffff"
                    placeholder="请选择"
                    border="none"
                    suffixIcon="arrow-right"
                ></u--input>
            </u-form-item>
            <u-form-item label="培训编码" prop="code">
                {{ formModel.code ? formModel.code : '' }}
            </u-form-item>
            <u-form-item label="培训主题" prop="subject">
                <u--input
                    v-model="formModel.subject"
                    border="surround"
                ></u--input>
            </u-form-item>
            <u-form-item
                label="培训人"
                prop="trainer.person.name"
                customStyle="letter-spacing: 0.5rem"
            >
                {{
                    formModel.trainer.person.name
                        ? formModel.trainer.person.name
                        : ''
                }}
            </u-form-item>
            <u-form-item
                label="参与人"
                prop="participants"
                customStyle="letter-spacing: 0.5rem"
                @click="editParticipant"
            >
                <text class="info" style="letter-spacing: normal">
                    已选择
                    <text
                        v-if="formModel.participantSize === 0"
                        class="danger"
                        style="margin: 0 5px"
                    >
                        0
                    </text>
                    <text v-else class="success" style="margin: 0 5px">
                        {{ formModel.participantSize }}
                    </text>
                    人
                </text>
                <u-icon slot="right" name="arrow-right"></u-icon>
            </u-form-item>
            <u-form-item
                label="预计开始"
                prop="estimatedStartTime"
                @click="estShow = !formModel.submittedAt"
            >
                <u--input
                    v-model="formModel.estimatedStartTime"
                    disabled
                    disabledColor="#ffffff"
                    placeholder="请选择"
                    border="none"
                    suffixIcon="calendar-fill"
                ></u--input>
            </u-form-item>
            <u-form-item
                label="预计结束"
                prop="estimatedEndTime"
                @click="eetShow = !formModel.submittedAt"
            >
                <u--input
                    v-model="formModel.estimatedEndTime"
                    disabled
                    disabledColor="#ffffff"
                    placeholder="请选择"
                    border="none"
                    suffixIcon="calendar-fill"
                ></u--input>
            </u-form-item>
            <u-form-item label="培训地址" prop="address">
                <u--textarea v-model="formModel.address"></u--textarea>
            </u-form-item>
            <u-form-item
                v-if="formModel.startedAt"
                label="过程图片"
                prop="files"
            >
                <u-upload
                    :capture="['camera']"
                    :fileList="files"
                    @afterRead="afterReadPicture()"
                    @delete="deletePicture"
                    :deletable="!formModel.endedAt"
                    :disabled="formModel.endedAt"
                >
                </u-upload>
            </u-form-item>
            <u-form-item
                v-if="formModel.startedAt"
                label="签到图片"
                prop="confirmFiles"
            >
                <u-upload
                    :capture="['camera']"
                    :fileList="confirmFiles"
                    @afterRead="afterReadConfirmPicture()"
                    @delete="deleteConfirmPicture"
                    :deletable="!formModel.endedAt"
                    :disabled="formModel.endedAt"
                >
                </u-upload>
            </u-form-item>
        </u--form>

        <u-datetime-picker
            closeOnClickOverlay
            :show="estShow"
            mode="datetime"
            @cancel="estShow = false"
            v-model="estTime"
            @close="estShow = false"
            @confirm="handleStartTimeConfirm"
        >
        </u-datetime-picker>
        <u-datetime-picker
            closeOnClickOverlay
            :show="eetShow"
            mode="datetime"
            @cancel="eetShow = false"
            v-model="eetTime"
            @close="eetShow = false"
            @confirm="handleEndTimeConfirm"
        >
        </u-datetime-picker>

        <view class="w-form-btn-content">
            <u-button
                v-if="isSubmitVisible()"
                type="primary"
                text="提交"
                @click="submit"
            />
            <u-button
                v-if="isStartVisible()"
                type="success"
                text="开始"
                @click="start"
            />
            <u-button
                v-if="isEndVisible()"
                type="error"
                text="结束"
                @click="end"
            />
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            titleObj: {
                create: '新增安全教育培训',
                update: '编辑安全教育培训',
                detail: '安全教育培训详情'
            },
            type: '',
            formModel: {
                id: '',
                project: null,
                code: '',
                subject: '',
                trainer: null,
                estimatedStartTime: '',
                estimatedEndTime: '',
                address: '',
                files: [],
                departments: [],
                staffs: []
            },
            estShow: false,
            eetShow: false,
            estTime: Number(new Date()),
            eetTime: Number(new Date()),
            files: [],
            confirmFiles: [],
            rules: {
                project: [
                    { type: 'object', required: true, message: '请选择项目' }
                ],
                subject: {
                    type: 'string',
                    required: true,
                    message: '请填写培训主题'
                },
                estimatedStartTime: {
                    type: 'string',
                    required: true,
                    message: '请填写预计开始时间'
                },
                estimatedEndTime: {
                    type: 'string',
                    required: true,
                    message: '请填写预计结束时间'
                },
                address: {
                    type: 'string',
                    required: true,
                    message: '请填写培训地点'
                }
            },
            projects: [],
            projectPickerVisible: false
        };
    },
    onLoad(option) {
        this.formModel.id = option.id;
        if (this.formModel.id) {
            this.type = 'detail';
        } else {
            this.type = 'create';
        }
        this.findOne();
    },
    onReady() {
        uni.setNavigationBarTitle({
            title: this.titleObj[this.type]
        });
        this.$refs.form.setRules(this.rules);
    },
    methods: {
        showProjectPicker() {
            this.projectPickerVisible = true;
        },
        hideProjectPicker(event) {
            if (event) {
                this.formModel.project = this.projects[event.indexs[0]];
                this.setAddress();
            }
            this.projectPickerVisible = false;
        },
        getProjects() {
            uni.request({
                url: '/api/ss/construction-project/find-all',
                success: (res) => {
                    this.projects = res.data;
                    if (this.projects.length > 0) {
                        this.formModel.project = this.projects[0];
                        this.setAddress();
                    }
                }
            });
        },
        setAddress() {
            if (this.formModel.project.shortName.endsWith('项目')) {
                this.formModel.address =
                    this.formModel.project.shortName + '部';
            } else {
                this.formModel.address =
                    this.formModel.project.shortName + '项目部';
            }
        },
        findOne() {
            uni.request({
                url: '/api/ss/safety-training/find-one-with-files',
                data: {
                    id: this.formModel.id
                },
                success: (res) => {
                    this.formModel = res.data;
                    if (this.formModel.estimatedStartTime) {
                        this.estTime = Date.parse(
                            this.formModel.estimatedStartTime
                        );
                    }
                    if (this.formModel.estimatedEndTime) {
                        this.eetTime = Date.parse(
                            this.formModel.estimatedEndTime
                        );
                    }
                    if (this.formModel.files) {
                        this.files = this.formModel.files.map((file) =>
                            uni.convertToFile(file)
                        );
                    }
                    if (this.formModel.confirmFiles) {
                        this.confirmFiles = this.formModel.confirmFiles.map(
                            (file) => uni.convertToFile(file)
                        );
                    }
                    this.getProjects();
                }
            });
        },
        verificationFailed() {
            uni.showToast({
                title: '请完成填写后提交',
                icon: 'none'
            });
        },
        submit() {
            let url = '/api/ss/safety-training/submit';
            url += '?department.id=';
            if (
                this.formModel.departments &&
                this.formModel.departments.length > 0
            ) {
                url += this.formModel.departments.join(',');
            }
            url += '&staff.id=';
            if (this.formModel.staffs && this.formModel.staffs.length > 0) {
                url += this.formModel.staffs.join(',');
            }
            uni.request({
                url,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json'
                },
                data: this.formModel,
                success: () => this.afterSubmit()
            });
        },
        afterSubmit() {
            uni.showModal({
                title: '提交成功',
                success: () => {
                    uni.navigateBack();
                }
            });
        },
        start() {
            this.$refs.form
                .validate()
                .then(() => {
                    uni.showModal({
                        title: '确定开始吗?',
                        success: (res) => {
                            if (res.confirm) {
                                uni.request({
                                    url: '/api/ss/safety-training/start',
                                    method: 'PUT',
                                    data: {
                                        id: this.formModel.id
                                    },
                                    success: () =>
                                        uni.showModal({
                                            title: '开始成功',
                                            success: () => {
                                                uni.navigateBack();
                                            }
                                        })
                                });
                            }
                        }
                    });
                })
                .catch(() => this.verificationFailed());
        },
        end() {
            if (!this.formModel.files || this.formModel.files.length === 0) {
                uni.showToast({
                    title: '请上传培训过程图片',
                    icon: 'none'
                });
                return;
            }
            const title =
                (!this.formModel.confirmFiles ||
                this.formModel.confirmFiles.length === 0
                    ? '签到图片未上传，'
                    : '') + '确定结束吗?';
            uni.showModal({
                title,
                success: (res) => {
                    if (res.confirm) {
                        let url =
                            '/api/ss/safety-training/end?id=' +
                            this.formModel.id;
                        if (this.files) {
                            url +=
                                '&file.id=' +
                                this.files.map((file) => file.id).join(',');
                        }
                        if (this.confirmFiles) {
                            url +=
                                '&confirmFile.id=' +
                                this.confirmFiles
                                    .map((file) => file.id)
                                    .join(',');
                        }
                        uni.request({
                            url,
                            method: 'PUT',
                            data: {
                                result: this.formModel.result
                            },
                            success: () =>
                                uni.showModal({
                                    title: '结束成功',
                                    success: () => {
                                        uni.navigateBack();
                                    }
                                })
                        });
                    }
                }
            });
        },
        isSubmitVisible() {
            return !this.formModel.submittedAt;
        },
        isStartVisible() {
            return (
                this.formModel.trainer &&
                this.formModel.trainer.person &&
                this.formModel.trainer.person.id ===
                    uni.getUserDetails().person.id &&
                this.formModel.submittedAt &&
                !this.formModel.startedAt
            );
        },
        isEndVisible() {
            return (
                this.formModel.trainer &&
                this.formModel.trainer.person &&
                this.formModel.trainer.person.id ===
                    uni.getUserDetails().person.id &&
                this.formModel.startedAt &&
                !this.formModel.endedAt
            );
        },
        editParticipant() {
            let url = `../../safety-training-participant/list/list?training.id=${this.formModel.id}&type=${this.type}`;
            if (
                this.formModel.departments &&
                this.formModel.departments.length > 0
            ) {
                url += `&departments=${this.formModel.departments.join(',')}`;
            }
            if (this.formModel.staffs && this.formModel.staffs.length > 0) {
                url += `&staffs=${this.formModel.staffs.join(',')}`;
            }
            uni.navigateTo({
                url
            });
        },
        async afterReadPicture(event) {
            if (!this.formModel.files) {
                this.formModel.files = [];
            }
            uni.afterReadFile(event, false, this.formModel.files, this.files);
        },
        deletePicture(event) {
            return new Promise((resolve) => {
                uni.request({
                    url: '/api/ss/safety-training/delete-file-by-asset',
                    method: 'DELETE',
                    data: {
                        id: this.formModel.id,
                        'asset.id': event.file.id
                    },
                    success: () => {
                        this.files.splice(event.index, 1);
                        resolve();
                    }
                });
            });
        },
        async afterReadConfirmPicture(event) {
            if (!this.formModel.confirmFiles) {
                this.formModel.confirmFiles = [];
            }
            uni.afterReadFile(
                event,
                false,
                this.formModel.confirmFiles,
                this.confirmFiles
            );
        },
        deleteConfirmPicture(event) {
            return new Promise((resolve) => {
                uni.request({
                    url: '/api/ss/safety-training/delete-confirm-file-by-asset',
                    method: 'DELETE',
                    data: {
                        id: this.formModel.id,
                        'asset.id': event.file.id
                    },
                    success: () => {
                        this.confirmFiles.splice(event.index, 1);
                        resolve();
                    }
                });
            });
        },
        handleStartTimeConfirm(e) {
            this.estShow = false;
            this.formModel.estimatedStartTime = uni.$u.timeFormat(
                e.value,
                'yyyy-mm-dd hh:MM:ss'
            );
        },
        handleEndTimeConfirm(e) {
            this.eetShow = false;
            this.formModel.estimatedEndTime = uni.$u.timeFormat(
                e.value,
                'yyyy-mm-dd hh:MM:ss'
            );
        },
        selectWorkers(params) {
            this.formModel.participantSize = params.selected;
            this.formModel.departments = params.departments;
            this.formModel.staffs = params.staffs;
        }
    }
};
</script>

<style>
.toolbar {
    display: flex;
}

.toolbar button {
    margin-right: 8rpx;
}

.toolbar :last-child {
    margin-right: 0;
}
</style>
