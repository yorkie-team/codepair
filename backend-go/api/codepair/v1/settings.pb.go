// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.36.3
// 	protoc        (unknown)
// source: codepair/v1/settings.proto

package v1

import (
	_ "google.golang.org/genproto/googleapis/api/annotations"
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type GetSettingsRequest struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *GetSettingsRequest) Reset() {
	*x = GetSettingsRequest{}
	mi := &file_codepair_v1_settings_proto_msgTypes[0]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *GetSettingsRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetSettingsRequest) ProtoMessage() {}

func (x *GetSettingsRequest) ProtoReflect() protoreflect.Message {
	mi := &file_codepair_v1_settings_proto_msgTypes[0]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetSettingsRequest.ProtoReflect.Descriptor instead.
func (*GetSettingsRequest) Descriptor() ([]byte, []int) {
	return file_codepair_v1_settings_proto_rawDescGZIP(), []int{0}
}

type GetSettingsResponse struct {
	state              protoimpl.MessageState    `protogen:"open.v1"`
	YorkieIntelligence *YorkieIntelligenceConfig `protobuf:"bytes,1,opt,name=yorkie_intelligence,json=yorkieIntelligence,proto3" json:"yorkie_intelligence,omitempty"`
	FileUpload         *FileUploadConfig         `protobuf:"bytes,2,opt,name=file_upload,json=fileUpload,proto3" json:"file_upload,omitempty"`
	unknownFields      protoimpl.UnknownFields
	sizeCache          protoimpl.SizeCache
}

func (x *GetSettingsResponse) Reset() {
	*x = GetSettingsResponse{}
	mi := &file_codepair_v1_settings_proto_msgTypes[1]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *GetSettingsResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetSettingsResponse) ProtoMessage() {}

func (x *GetSettingsResponse) ProtoReflect() protoreflect.Message {
	mi := &file_codepair_v1_settings_proto_msgTypes[1]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetSettingsResponse.ProtoReflect.Descriptor instead.
func (*GetSettingsResponse) Descriptor() ([]byte, []int) {
	return file_codepair_v1_settings_proto_rawDescGZIP(), []int{1}
}

func (x *GetSettingsResponse) GetYorkieIntelligence() *YorkieIntelligenceConfig {
	if x != nil {
		return x.YorkieIntelligence
	}
	return nil
}

func (x *GetSettingsResponse) GetFileUpload() *FileUploadConfig {
	if x != nil {
		return x.FileUpload
	}
	return nil
}

type YorkieIntelligenceConfig struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	Enable        bool                   `protobuf:"varint,1,opt,name=enable,proto3" json:"enable,omitempty"`
	Config        string                 `protobuf:"bytes,2,opt,name=config,proto3" json:"config,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *YorkieIntelligenceConfig) Reset() {
	*x = YorkieIntelligenceConfig{}
	mi := &file_codepair_v1_settings_proto_msgTypes[2]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *YorkieIntelligenceConfig) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*YorkieIntelligenceConfig) ProtoMessage() {}

func (x *YorkieIntelligenceConfig) ProtoReflect() protoreflect.Message {
	mi := &file_codepair_v1_settings_proto_msgTypes[2]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use YorkieIntelligenceConfig.ProtoReflect.Descriptor instead.
func (*YorkieIntelligenceConfig) Descriptor() ([]byte, []int) {
	return file_codepair_v1_settings_proto_rawDescGZIP(), []int{2}
}

func (x *YorkieIntelligenceConfig) GetEnable() bool {
	if x != nil {
		return x.Enable
	}
	return false
}

func (x *YorkieIntelligenceConfig) GetConfig() string {
	if x != nil {
		return x.Config
	}
	return ""
}

type FileUploadConfig struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	Enable        bool                   `protobuf:"varint,1,opt,name=enable,proto3" json:"enable,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *FileUploadConfig) Reset() {
	*x = FileUploadConfig{}
	mi := &file_codepair_v1_settings_proto_msgTypes[3]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *FileUploadConfig) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*FileUploadConfig) ProtoMessage() {}

func (x *FileUploadConfig) ProtoReflect() protoreflect.Message {
	mi := &file_codepair_v1_settings_proto_msgTypes[3]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use FileUploadConfig.ProtoReflect.Descriptor instead.
func (*FileUploadConfig) Descriptor() ([]byte, []int) {
	return file_codepair_v1_settings_proto_rawDescGZIP(), []int{3}
}

func (x *FileUploadConfig) GetEnable() bool {
	if x != nil {
		return x.Enable
	}
	return false
}

var File_codepair_v1_settings_proto protoreflect.FileDescriptor

var file_codepair_v1_settings_proto_rawDesc = []byte{
	0x0a, 0x1a, 0x63, 0x6f, 0x64, 0x65, 0x70, 0x61, 0x69, 0x72, 0x2f, 0x76, 0x31, 0x2f, 0x73, 0x65,
	0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x0b, 0x63, 0x6f,
	0x64, 0x65, 0x70, 0x61, 0x69, 0x72, 0x2e, 0x76, 0x31, 0x1a, 0x1c, 0x67, 0x6f, 0x6f, 0x67, 0x6c,
	0x65, 0x2f, 0x61, 0x70, 0x69, 0x2f, 0x61, 0x6e, 0x6e, 0x6f, 0x74, 0x61, 0x74, 0x69, 0x6f, 0x6e,
	0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22, 0x14, 0x0a, 0x12, 0x47, 0x65, 0x74, 0x53, 0x65,
	0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x22, 0xad, 0x01,
	0x0a, 0x13, 0x47, 0x65, 0x74, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x52, 0x65, 0x73,
	0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x56, 0x0a, 0x13, 0x79, 0x6f, 0x72, 0x6b, 0x69, 0x65, 0x5f,
	0x69, 0x6e, 0x74, 0x65, 0x6c, 0x6c, 0x69, 0x67, 0x65, 0x6e, 0x63, 0x65, 0x18, 0x01, 0x20, 0x01,
	0x28, 0x0b, 0x32, 0x25, 0x2e, 0x63, 0x6f, 0x64, 0x65, 0x70, 0x61, 0x69, 0x72, 0x2e, 0x76, 0x31,
	0x2e, 0x59, 0x6f, 0x72, 0x6b, 0x69, 0x65, 0x49, 0x6e, 0x74, 0x65, 0x6c, 0x6c, 0x69, 0x67, 0x65,
	0x6e, 0x63, 0x65, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x52, 0x12, 0x79, 0x6f, 0x72, 0x6b, 0x69,
	0x65, 0x49, 0x6e, 0x74, 0x65, 0x6c, 0x6c, 0x69, 0x67, 0x65, 0x6e, 0x63, 0x65, 0x12, 0x3e, 0x0a,
	0x0b, 0x66, 0x69, 0x6c, 0x65, 0x5f, 0x75, 0x70, 0x6c, 0x6f, 0x61, 0x64, 0x18, 0x02, 0x20, 0x01,
	0x28, 0x0b, 0x32, 0x1d, 0x2e, 0x63, 0x6f, 0x64, 0x65, 0x70, 0x61, 0x69, 0x72, 0x2e, 0x76, 0x31,
	0x2e, 0x46, 0x69, 0x6c, 0x65, 0x55, 0x70, 0x6c, 0x6f, 0x61, 0x64, 0x43, 0x6f, 0x6e, 0x66, 0x69,
	0x67, 0x52, 0x0a, 0x66, 0x69, 0x6c, 0x65, 0x55, 0x70, 0x6c, 0x6f, 0x61, 0x64, 0x22, 0x4a, 0x0a,
	0x18, 0x59, 0x6f, 0x72, 0x6b, 0x69, 0x65, 0x49, 0x6e, 0x74, 0x65, 0x6c, 0x6c, 0x69, 0x67, 0x65,
	0x6e, 0x63, 0x65, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x12, 0x16, 0x0a, 0x06, 0x65, 0x6e, 0x61,
	0x62, 0x6c, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x08, 0x52, 0x06, 0x65, 0x6e, 0x61, 0x62, 0x6c,
	0x65, 0x12, 0x16, 0x0a, 0x06, 0x63, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x18, 0x02, 0x20, 0x01, 0x28,
	0x09, 0x52, 0x06, 0x63, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x22, 0x2a, 0x0a, 0x10, 0x46, 0x69, 0x6c,
	0x65, 0x55, 0x70, 0x6c, 0x6f, 0x61, 0x64, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x12, 0x16, 0x0a,
	0x06, 0x65, 0x6e, 0x61, 0x62, 0x6c, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x08, 0x52, 0x06, 0x65,
	0x6e, 0x61, 0x62, 0x6c, 0x65, 0x32, 0x76, 0x0a, 0x0f, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67,
	0x73, 0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x12, 0x63, 0x0a, 0x0b, 0x47, 0x65, 0x74, 0x53,
	0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x12, 0x1f, 0x2e, 0x63, 0x6f, 0x64, 0x65, 0x70, 0x61,
	0x69, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x47, 0x65, 0x74, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67,
	0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x20, 0x2e, 0x63, 0x6f, 0x64, 0x65, 0x70,
	0x61, 0x69, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x47, 0x65, 0x74, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e,
	0x67, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x22, 0x11, 0x82, 0xd3, 0xe4, 0x93,
	0x02, 0x0b, 0x12, 0x09, 0x2f, 0x73, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x42, 0x3f, 0x5a,
	0x3d, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f, 0x6d, 0x2f, 0x79, 0x6f, 0x72, 0x6b,
	0x69, 0x65, 0x2d, 0x74, 0x65, 0x61, 0x6d, 0x2f, 0x63, 0x6f, 0x64, 0x65, 0x70, 0x61, 0x69, 0x72,
	0x2f, 0x62, 0x61, 0x63, 0x6b, 0x65, 0x6e, 0x64, 0x2d, 0x67, 0x6f, 0x2f, 0x61, 0x70, 0x69, 0x2f,
	0x63, 0x6f, 0x64, 0x65, 0x61, 0x70, 0x69, 0x72, 0x2f, 0x76, 0x31, 0x3b, 0x76, 0x31, 0x62, 0x06,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_codepair_v1_settings_proto_rawDescOnce sync.Once
	file_codepair_v1_settings_proto_rawDescData = file_codepair_v1_settings_proto_rawDesc
)

func file_codepair_v1_settings_proto_rawDescGZIP() []byte {
	file_codepair_v1_settings_proto_rawDescOnce.Do(func() {
		file_codepair_v1_settings_proto_rawDescData = protoimpl.X.CompressGZIP(file_codepair_v1_settings_proto_rawDescData)
	})
	return file_codepair_v1_settings_proto_rawDescData
}

var file_codepair_v1_settings_proto_msgTypes = make([]protoimpl.MessageInfo, 4)
var file_codepair_v1_settings_proto_goTypes = []any{
	(*GetSettingsRequest)(nil),       // 0: codepair.v1.GetSettingsRequest
	(*GetSettingsResponse)(nil),      // 1: codepair.v1.GetSettingsResponse
	(*YorkieIntelligenceConfig)(nil), // 2: codepair.v1.YorkieIntelligenceConfig
	(*FileUploadConfig)(nil),         // 3: codepair.v1.FileUploadConfig
}
var file_codepair_v1_settings_proto_depIdxs = []int32{
	2, // 0: codepair.v1.GetSettingsResponse.yorkie_intelligence:type_name -> codepair.v1.YorkieIntelligenceConfig
	3, // 1: codepair.v1.GetSettingsResponse.file_upload:type_name -> codepair.v1.FileUploadConfig
	0, // 2: codepair.v1.SettingsService.GetSettings:input_type -> codepair.v1.GetSettingsRequest
	1, // 3: codepair.v1.SettingsService.GetSettings:output_type -> codepair.v1.GetSettingsResponse
	3, // [3:4] is the sub-list for method output_type
	2, // [2:3] is the sub-list for method input_type
	2, // [2:2] is the sub-list for extension type_name
	2, // [2:2] is the sub-list for extension extendee
	0, // [0:2] is the sub-list for field type_name
}

func init() { file_codepair_v1_settings_proto_init() }
func file_codepair_v1_settings_proto_init() {
	if File_codepair_v1_settings_proto != nil {
		return
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_codepair_v1_settings_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   4,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_codepair_v1_settings_proto_goTypes,
		DependencyIndexes: file_codepair_v1_settings_proto_depIdxs,
		MessageInfos:      file_codepair_v1_settings_proto_msgTypes,
	}.Build()
	File_codepair_v1_settings_proto = out.File
	file_codepair_v1_settings_proto_rawDesc = nil
	file_codepair_v1_settings_proto_goTypes = nil
	file_codepair_v1_settings_proto_depIdxs = nil
}
