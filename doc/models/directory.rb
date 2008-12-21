class Directory
  include InitFromPath
  
  attr_accessor :path, :pwd

  def dir_handle
    @dir_handle ||= Dir.new( path )
  end
  
  def entries_glob
    if path[path.length-1..path.length] == "/"
      path + "*"
    else
      path + "/*"
    end
  end
  
  def content
    return @content if @content
    @content = Dir.glob(entries_glob).collect do |p|
      { :isFile => File.file?(p), :path => p }
    end
    @content
  end
  
  def to_json
    {:path => @path, :content => content}.to_json

  end

end
