class Document
  attr_accessor :path, :pwd
  
  def initialize opts={}
    @path = opts[:path]
    @pwd = opts[:pwd]
    resolve_path if @pwd
  end

  def path_is_absolute?
    @path[0..0] == "/"
  end

  def resolve_path
    return @path if path_is_absolute?

    @pwd << "/" if @pwd[@pwd.length-1..@pwd.length-1] != "/"
    @path = @pwd + @path
  end
  
  def file_handle
    @file_handle ||= File.open(path)
  end
  
  def content
    @content ||=  file_handle.read
  end
  
  def content= c
    @content = c
  end
  
  def to_json
    {:path => @path, :modified => file_handle.mtime, :content => content}.to_json
  end
  
  def save
    File.open(@path, "w"){|f| f << content }
  end
end
